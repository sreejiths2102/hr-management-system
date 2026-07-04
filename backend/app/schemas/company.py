from pydantic import BaseModel, EmailStr


class CompanyRegister(BaseModel):
    company_name: str
    logo: str | None = None
    hr_name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str
