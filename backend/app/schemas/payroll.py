from decimal import Decimal
from pydantic import BaseModel


class PayrollCreate(BaseModel):
    monthly_salary: Decimal
    month: str
    user_id: int | None = None


class PayrollCalculate(BaseModel):
    monthly_salary: Decimal


class PayrollComponent(BaseModel):
    monthly_salary: str
    basic: str
    hra: str
    allowance: str
    pf: str
    professional_tax: str
    net_salary: str
    month: str
