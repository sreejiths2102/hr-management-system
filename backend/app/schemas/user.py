from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr


class CreateUser(BaseModel):
    company_id: int
    name: str
    email: EmailStr
    phone: str
    department: str | None = None
    designation: str | None = None
    joining_date: date | None = None
    salary: float | None = None
    profile_picture: str | None = None
    address: str | None = None
    role: Literal["employee", "hr"] = "employee"


class UpdateUser(BaseModel):
    name: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    salary: float | None = None
    profile_picture: str | None = None
    address: str | None = None


class UpdateOwnProfile(BaseModel):
    """Schema for employees editing their own limited fields."""
    phone: str | None = None
    address: str | None = None
    profile_picture: str | None = None


class UserListItem(BaseModel):
    id: int
    name: str
    role: str
    department: str | None = None