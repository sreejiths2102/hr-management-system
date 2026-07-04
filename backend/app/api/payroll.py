from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.salary import Salary
from app.models.user import User
from app.services.attendance_service import get_user_from_token
from app.services.salary_service import build_salary_record, calculate_salary_components

router = APIRouter(prefix="/payroll", tags=["Payroll"])


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


@router.get("")
def list_payroll(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    query = db.query(Salary).join(User, User.id == Salary.user_id)
    if current_user.role != "hr" and not current_user.is_company_admin:
        query = query.filter(User.id == current_user.id)
    else:
        query = query.filter(User.company_id == current_user.company_id)
    records = query.order_by(Salary.created_at.desc()).all()
    return [
        {
            "id": record.id,
            "user_id": record.user_id,
            "monthly_salary": str(record.monthly_salary),
            "basic": str(record.basic),
            "hra": str(record.hra),
            "allowance": str(record.allowance),
            "pf": str(record.pf),
            "professional_tax": str(record.professional_tax),
            "net_salary": str(record.net_salary),
            "month": record.month,
        }
        for record in records
    ]


@router.put("/{salary_id}")
def update_payroll(
    salary_id: int,
    monthly_salary: Decimal,
    month: str,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    if current_user.role != "hr" and not current_user.is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")

    salary_record = db.query(Salary).filter(Salary.id == salary_id).first()
    if not salary_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salary record not found")

    components = calculate_salary_components(monthly_salary)
    for field_name, value in components.items():
        setattr(salary_record, field_name, value)
    setattr(salary_record, "month", month)
    db.commit()
    db.refresh(salary_record)
    return {"message": "Payroll updated", "salary_id": salary_record.id}