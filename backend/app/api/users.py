from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import cast

from app.core.security import hash_password
from app.db.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.user import CreateUser, UpdateUser, UserListItem
from app.services.id_generator import generate_employee_id, generate_login_id, generate_password

router = APIRouter(prefix="/users", tags=["Users"])


def _get_company(db: Session, company_id: int) -> Company:
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company


def _next_employee_serial(db: Session, company_id: int) -> int:
    return db.query(User).filter(User.company_id == company_id).count() + 1


@router.post("")
def create_user(payload: CreateUser, db: Session = Depends(get_db)):
    _get_company(db, payload.company_id)

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    employee_serial = _next_employee_serial(db, payload.company_id)
    employee_id = generate_employee_id(employee_serial)
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    company_code = company.company_code if company else ""
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
    _get_company(db, company_id)
    query = db.query(User).filter(User.company_id == company_id, User.is_active == True)  # noqa: E712
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
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
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
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field_name, value)

    db.commit()
    db.refresh(user)

    return {"message": "User Updated"}


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    setattr(user, "is_active", False)
    db.commit()

    return {"message": "User Deactivated"}