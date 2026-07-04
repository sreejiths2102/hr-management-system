from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import cast

from app.core.security import hash_password
from app.db.database import get_db
from app.models.company import Company
from app.models.salary import Salary
from app.models.user import User
from app.schemas.user import CreateUser, UpdateOwnProfile, UpdateUser, UserListItem
from app.services.attendance_service import get_user_from_token
from app.services.id_generator import generate_employee_id, generate_login_id, generate_password

router = APIRouter(prefix="/users", tags=["Users"])


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


@router.get("/me")
def get_my_profile(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    """Authenticated employee fetches their own full profile + latest salary."""
    current_user = get_user_from_token(db, _token_from_header(authorization))

    latest_salary = (
        db.query(Salary)
        .filter(Salary.user_id == current_user.id)
        .order_by(Salary.created_at.desc())
        .first()
    )

    return {
        "id": cast(int, current_user.id),
        "company_id": cast(int, current_user.company_id),
        "employee_id": cast(str, current_user.employee_id),
        "login_id": cast(str, current_user.login_id),
        "name": cast(str, current_user.name),
        "email": cast(str, current_user.email),
        "phone": cast(str | None, current_user.phone),
        "department": cast(str | None, current_user.department),
        "designation": cast(str | None, current_user.designation),
        "joining_date": current_user.joining_date,
        "salary": current_user.salary,
        "profile_picture": cast(str | None, current_user.profile_picture),
        "address": cast(str | None, current_user.address),
        "role": cast(str, current_user.role),
        "is_company_admin": cast(bool, current_user.is_company_admin),
        "latest_salary": {
            "monthly_salary": str(latest_salary.monthly_salary),
            "basic": str(latest_salary.basic),
            "hra": str(latest_salary.hra),
            "allowance": str(latest_salary.allowance),
            "pf": str(latest_salary.pf),
            "professional_tax": str(latest_salary.professional_tax),
            "net_salary": str(latest_salary.net_salary),
            "month": latest_salary.month,
        } if latest_salary else None,
    }


@router.put("/me")
def update_my_profile(
    payload: UpdateOwnProfile,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    """Authenticated employee updates their own limited profile fields."""
    current_user = get_user_from_token(db, _token_from_header(authorization))

    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field_name, value)

    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully"}


def _get_company_code(db: Session, company_id: int) -> str:
    company_code = db.query(Company.company_code).filter(Company.id == company_id).scalar()
    if not company_code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company_code


def _next_employee_serial(db: Session, company_id: int) -> int:
    return db.query(User).filter(User.company_id == company_id).count() + 1


@router.post("")
def create_user(payload: CreateUser, db: Session = Depends(get_db)):
    company_code = _get_company_code(db, payload.company_id)

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    employee_serial = _next_employee_serial(db, payload.company_id)
    employee_id = generate_employee_id(employee_serial)
    login_id = generate_login_id(company_code, payload.name, employee_serial)
    temporary_password = generate_password()

    user = User(
        company_id=payload.company_id,
        employee_id=employee_id,
        login_id=login_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password=hash_password(temporary_password),
        role=payload.role,
        department=payload.department,
        designation=payload.designation,
        joining_date=payload.joining_date,
        salary=payload.salary,
        profile_picture=payload.profile_picture,
        address=payload.address,
        must_change_password=True,
        is_active=True,
        is_company_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User Created",
        "employee_id": user.employee_id,
        "login_id": user.login_id,
        "temporary_password": temporary_password,
    }


@router.get("")
def list_users(
    company_id: int,
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    department: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    _get_company_code(db, company_id)  # Efficiently check if company exists
    query = db.query(User).filter(User.company_id == company_id, User.is_active.is_(True))
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(search_term)) | (User.email.ilike(search_term)) | (User.employee_id.ilike(search_term)) | (User.login_id.ilike(search_term)))
    if role:
        query = query.filter(User.role == role)
    if department:
        query = query.filter(User.department == department)
    users = query.all()
    return [
        UserListItem(
            id=cast(int, user.id),
            name=cast(str, user.name),
            role=cast(str, user.role),
            department=cast(str | None, user.department),
        )
        for user in users
    ]


@router.get("/{user_id}")
def view_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "id": cast(int, user.id),
        "company_id": cast(int, user.company_id),
        "employee_id": cast(str, user.employee_id),
        "login_id": cast(str, user.login_id),
        "name": cast(str, user.name),
        "email": cast(str, user.email),
        "phone": cast(str | None, user.phone),
        "department": cast(str | None, user.department),
        "designation": cast(str | None, user.designation),
        "joining_date": user.joining_date,
        "salary": user.salary,
        "profile_picture": cast(str | None, user.profile_picture),
        "address": cast(str | None, user.address),
        "role": cast(str, user.role),
        "is_company_admin": cast(bool, user.is_company_admin),
        "is_active": cast(bool, user.is_active),
    }


@router.put("/{user_id}")
def update_user(user_id: int, payload: UpdateUser, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field_name, value)

    db.commit()
    db.refresh(user)

    return {"message": "User Updated"}


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    setattr(user, "is_active", False)
    db.commit()

    return {"message": "User Deactivated"}