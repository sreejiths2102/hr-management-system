from datetime import date

from pydantic import BaseModel


class LeaveCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None
