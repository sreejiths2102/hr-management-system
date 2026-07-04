import os
from datetime import datetime, timedelta, timezone
from typing import cast

from jose import jwt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.db.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest, LoginRequest
from app.schemas.company import CompanyRegister
from app.services.id_generator import generate_company_code, generate_login_id

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

JWT_SECRET = os.getenv("JWT_SECRET", "hrms-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "120"))


def create_access_token(payload: dict) -> str:
    token_payload = payload.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRES_MINUTES)
    token_payload["exp"] = expire
    encoded_jwt = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def _next_employee_serial(db: Session, company_id: int) -> int:
    count = db.query(User).filter(User.company_id == company_id).count()
    return count + 1


def _next_company_serial(db: Session) -> int:
    return db.query(Company).count() + 1


def _find_user_by_login_or_email(db: Session, login: str) -> User | None:
    normalized_login = login.strip()
    return (
        db.query(User)
        .filter(
            or_(
                User.login_id == normalized_login,
                User.email == normalized_login,
            )
        )
        .first()
    )


@router.get("/company/status")
def company_status(db: Session = Depends(get_db)) -> dict[str, bool]:
    # Use a more efficient query that doesn't select all columns for a simple count.
    # This avoids the UndefinedColumn error if the model and DB schema are out of sync.
    company_exists = db.query(db.query(Company).exists()).scalar()
    return {"company_exists": company_exists}


@router.post("/register")
@router.post("/register-company")
def register_company(payload: CompanyRegister, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")

    company_exists = db.query(db.query(Company).exists()).scalar()
    if company_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company already registered")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    company_serial = _next_company_serial(db)
    company_code = generate_company_code(payload.company_name, company_serial)
    existing_company = db.query(Company).filter(Company.company_code == company_code).first()
    if existing_company:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to generate unique company code")

    company = Company(
        company_name=payload.company_name,
        company_code=company_code,
        logo=payload.logo,
    )
    db.add(company)
    db.flush()

    company_id = cast(int, company.id)
    employee_serial = _next_employee_serial(db, company_id)
    employee_id = f"{company.company_code}{employee_serial:04d}"
    login_id = generate_login_id(company.company_code, payload.hr_name, employee_serial)

    hr_user = User(
        company_id=company_id,
        employee_id=employee_id,
        login_id=login_id,
        name=payload.hr_name,
        email=payload.email,
        phone=payload.phone,
        password=hash_password(payload.password),
        role="hr",
        is_company_admin=True,
        must_change_password=False,
    )
    db.add(hr_user)
    db.commit()
    db.refresh(company)
    db.refresh(hr_user)

    return {
        "message": "Company registered successfully",
        "company": {
            "id": company.id,
            "company_name": company.company_name,
            "company_code": company.company_code,
        },
        "first_hr": {
            "id": hr_user.id,
            "employee_id": hr_user.employee_id,
            "login_id": hr_user.login_id,
            "name": hr_user.name,
            "email": hr_user.email,
            "role": hr_user.role,
            "is_company_admin": hr_user.is_company_admin,
        },
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = _find_user_by_login_or_email(db, payload.login)
    hashed_password = cast(str, user.password) if user else ""
    if not user or not verify_password(payload.password, hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")

    user_role = getattr(user, "role")

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "company_id": user.company_id,
            "role": user.role,
            "login_id": user.login_id,
        }
    )

    return {
        "message": "Login successful",
        "token": access_token,
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": user.must_change_password,
        "role": user.role,
        "is_company_admin": user.is_company_admin,
        "dashboard": "hr" if user_role == "hr" else "employee",
        "user": {
            "id": user.id,
            "company_id": user.company_id,
            "employee_id": user.employee_id,
            "login_id": user.login_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_company_admin": user.is_company_admin,
        },
    }


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = _find_user_by_login_or_email(db, payload.login)
    hashed_password = cast(str, user.password) if user else ""
    if not user or not verify_password(payload.current_password, hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login credentials")

    setattr(user, "password", hash_password(payload.new_password))
    setattr(user, "must_change_password", False)
    db.commit()

    return {"message": "Password updated successfully"}