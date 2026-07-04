from sqlalchemy import Column, ForeignKey, Integer, Numeric, String

from app.db.database import Base


class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(30), ForeignKey("users.employee_id"), nullable=False)
    basic_salary = Column(Numeric(12, 2), nullable=False, default=0)
    allowances = Column(Numeric(12, 2), nullable=False, default=0)
    deductions = Column(Numeric(12, 2), nullable=False, default=0)
    net_salary = Column(Numeric(12, 2), nullable=False, default=0)
    month = Column(String(20), nullable=False)