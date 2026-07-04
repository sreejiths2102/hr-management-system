from calendar import monthrange
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.attendance import Attendance
from app.models.user import User
from app.services.attendance_service import (
    create_check_in,
    create_check_out,
    get_today_status,
    get_user_from_token,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


@router.post("/check-in")
def check_in(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    user = get_user_from_token(db, _token_from_header(authorization))
    attendance = create_check_in(db, user)
    return {"message": "Check In Successful", "attendance_id": attendance.id, "status": attendance.status}


@router.post("/check-out")
def check_out(
    break_minutes: int | None = None,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(db, _token_from_header(authorization))
    attendance = create_check_out(db, user, break_minutes=break_minutes)
    return {
        "message": "Check Out Successful",
        "attendance_id": attendance.id,
        "working_minutes": attendance.working_minutes,
        "break_minutes": break_minutes,
    }


def _business_days(start_date: date, end_date: date) -> list[date]:
    current = start_date
    business_days = []
    while current <= end_date:
        if current.weekday() < 5:
            business_days.append(current)
        current += timedelta(days=1)
    return business_days


def _payable_value(status: str | None) -> float:
    if not status:
        return 0.0
    normalized = status.strip().lower()
    if "unpaid" in normalized or normalized == "absent":
        return 0.0
    if "half" in normalized:
        return 0.5
    return 1.0


@router.get("")
def list_my_attendance(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
    year: int | None = None,
    month: int | None = None,
):
    user = get_user_from_token(db, _token_from_header(authorization))
    today = date.today()
    year = year or today.year
    month = month or today.month
    days_in_month = monthrange(year, month)[1]
    start_date = date(year, month, 1)
    end_date = date(year, month, days_in_month)

    records = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id)
        .filter(Attendance.date >= start_date)
        .filter(Attendance.date <= end_date)
        .order_by(Attendance.date.desc())
        .all()
    )

    records_by_date = {record.date: record for record in records}
    business_days = _business_days(start_date, end_date)

    attendance_days = []
    total_present = 0
    total_approved_leave = 0
    total_unpaid_leave = 0
    total_absent = 0
    payable_days = 0.0

    for current_date in business_days:
        record = records_by_date.get(current_date)
        if record:
            check_in = record.check_in
            check_out = record.check_out
            total_duration = None
            break_minutes = None
            if check_in and check_out and record.working_minutes is not None:
                total_duration = int((check_out - check_in).total_seconds() // 60)
                break_minutes = total_duration - record.working_minutes

            status = record.status or "Absent"
            payable = _payable_value(status)
            payable_days += payable

            if "unpaid" in status.lower():
                total_unpaid_leave += 1
            elif "leave" in status.lower():
                total_approved_leave += 1
            elif "absent" in status.lower():
                total_absent += 1
            else:
                total_present += 1

            attendance_days.append(
                {
                    "date": current_date,
                    "check_in": check_in,
                    "check_out": check_out,
                    "working_minutes": record.working_minutes,
                    "total_duration_minutes": total_duration,
                    "break_minutes": break_minutes,
                    "status": status,
                    "remarks": record.remarks,
                    "payable": payable,
                }
            )
        else:
            total_absent += 1
            attendance_days.append(
                {
                    "date": current_date,
                    "check_in": None,
                    "check_out": None,
                    "working_minutes": None,
                    "total_duration_minutes": None,
                    "break_minutes": None,
                    "status": "Absent",
                    "remarks": "No attendance record",
                    "payable": 0.0,
                }
            )

    return {
        "year": year,
        "month": month,
        "total_days_in_month": days_in_month,
        "total_working_days": len(business_days),
        "present_days": total_present,
        "approved_leave_days": total_approved_leave,
        "unpaid_leave_days": total_unpaid_leave,
        "absent_days": total_absent,
        "payable_days": payable_days,
        "attendance_days": attendance_days,
    }


@router.get("/all")
def list_all_attendance(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    user = get_user_from_token(db, _token_from_header(authorization))
    if user.role != "hr" and not user.is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")

    records = (
        db.query(Attendance)
        .join(User, User.id == Attendance.user_id)
        .filter(User.company_id == user.company_id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return [
        {
            "user_id": record.user_id,
            "date": record.date,
            "check_in": record.check_in,
            "check_out": record.check_out,
            "working_minutes": record.working_minutes,
            "status": record.status,
            "remarks": record.remarks,
        }
        for record in records
    ]
