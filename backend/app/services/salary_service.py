from decimal import Decimal

from app.models.salary import Salary


def calculate_salary_components(monthly_salary: Decimal | float | int) -> dict:
    gross = Decimal(str(monthly_salary))
    basic = (gross * Decimal("0.50")).quantize(Decimal("0.01"))
    hra = (gross * Decimal("0.25")).quantize(Decimal("0.01"))
    allowance = Decimal("0.00")
    pf = Decimal("3000.00") if gross >= Decimal("3000.00") else (gross * Decimal("0.06")).quantize(Decimal("0.01"))
    professional_tax = Decimal("200.00")
    net_salary = (basic + hra + allowance - pf - professional_tax).quantize(Decimal("0.01"))
    return {
        "monthly_salary": gross.quantize(Decimal("0.01")),
        "basic": basic,
        "hra": hra,
        "allowance": allowance,
        "pf": pf,
        "professional_tax": professional_tax,
        "net_salary": net_salary,
    }


def build_salary_record(user_id: int, monthly_salary: Decimal | float | int, month: str) -> Salary:
    components = calculate_salary_components(monthly_salary)
    return Salary(user_id=user_id, month=month, **components)