from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyUpdate
from app.services.attendance_service import get_user_from_token

router = APIRouter(prefix="/company", tags=["Company"])


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


@router.get("/status")
def company_status(db: Session = Depends(get_db)):
    company = db.query(Company).first()
    return {"company_exists": company is not None}


@router.get("")
def get_company(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    if not current_user.is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Company admin access required")

    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    return {
        "id": company.id,
        "company_name": company.company_name,
        "company_code": company.company_code,
        "logo": company.logo,
        "email": company.email,
        "phone": company.phone,
        "address": company.address,
        "created_at": company.created_at,
    }


@router.put("")
def update_company(
    payload: CompanyUpdate,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    if not current_user.is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Company admin access required")

    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field_name, value)

    db.commit()
    db.refresh(company)
    return {"message": "Company updated", "company_id": company.id}
