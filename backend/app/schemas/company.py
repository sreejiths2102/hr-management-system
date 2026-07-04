from pydantic import BaseModel, EmailStr


class CompanyRegister(BaseModel):
    company_name: str
    logo: str | None = None
    hr_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str


class CompanyUpdate(BaseModel):
    company_name: str | None = None
    logo: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
from pydantic import BaseModel, EmailStr


class CompanyRegister(BaseModel):
    company_name: str
    logo: str | None = None
    hr_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str
