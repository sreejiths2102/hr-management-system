from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    login: str
    password: str


class ChangePasswordRequest(BaseModel):
    login: str
    current_password: str
    new_password: str


class CompanyRegister(BaseModel):
    company_name: str
    hr_name: str
    email: EmailStr
    phone: str
    password: str