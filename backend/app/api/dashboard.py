from datetime import date

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.user import User
from app.services.attendance_service import get_today_status, get_user_from_token

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()
@router.get("/hr")
def hr_dashboard(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    user_role = getattr(current_user, "role")
    is_company_admin = getattr(current_user, "is_company_admin")
    if user_role != "hr" and not is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")

    users = db.query(User).filter(User.company_id == current_user.company_id, User.is_active == True).all()  # noqa: E712
    total_users = len(users)
    present_count = 0
    leave_count = 0
    absent_count = 0
    for user in users:
        status_value = get_today_status(db, user)
        normalized_status = status_value.lower()
        if normalized_status == "leave":
            leave_count += 1
        elif normalized_status == "present":
            present_count += 1
        else:
            absent_count += 1

        attendance = (
            db.query(Attendance)
            .filter(Attendance.user_id == user.id, Attendance.date == date.today())
            .first()
        )

    pending_leaves = (
        db.query(LeaveRequest)
        .join(User, User.id == LeaveRequest.user_id)
        .filter(User.company_id == current_user.company_id, LeaveRequest.status == "Pending")
        .count()
    )
    return {
        "total_users": total_users,
        "present": present_count,
        "leave": leave_count,
        "absent": absent_count,
        "pending_leaves": pending_leaves,
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "designation": user.designation,
                "department": user.department,
                "status": get_today_status(db, user),
            }
            for user in users
        ],
        "settings_enabled": is_company_admin,
    }


@router.get("/employee")
def employee_dashboard(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    if getattr(current_user, "role") == "hr":
        return {"message": "HR should use /dashboard/hr"}

    today_attendance = (
        db.query(Attendance)
        .filter(Attendance.user_id == current_user.id, Attendance.date == date.today())
        .first()
    )
    recent_activity = (
        db.query(Attendance)
        .filter(Attendance.user_id == current_user.id)
        .order_by(Attendance.date.desc())
        .limit(5)
        .all()
    )

    return {
        "today_status": get_today_status(db, current_user),
        "checked_in": bool(today_attendance is not None and today_attendance.check_in is not None),
        "recent_activity": [
            {
                "date": record.date,
                "status": record.status,
                "check_in": record.check_in,
                "check_out": record.check_out,
            }
            for record in recent_activity
        ],
        "profile": {
            "id": current_user.id,
            "name": current_user.name,
            "employee_id": current_user.employee_id,
            "designation": current_user.designation,
            "department": current_user.department,
            "email": current_user.email,
            "phone": current_user.phone,
            "joining_date": current_user.joining_date,
            "address": current_user.address,
        },
    }
