from datetime import datetime
import random
import string
import re

def generate_company_code(company_name: str, serial: int | None = None):
    words = re.findall(r"[A-Za-z]+", company_name.upper())

    if len(words) == 1:
        return words[0][:3]

    return "".join(word[0] for word in words[:3])


def generate_login_id(company_code, employee_name, serial):
    names = employee_name.upper().split()
    initials = ""
    for name in names:
        initials += name[:2]
    year = datetime.now().year
    return f"{company_code.upper()}{initials}{year}{serial:04d}"


def generate_password(length: int = 10):
    chars = string.ascii_letters + string.digits
    return "".join(random.choice(chars) for _ in range(length))

def generate_employee_id(serial: int):

    return f"EMP{serial:05d}"