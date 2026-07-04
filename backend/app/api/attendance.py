from datetime import date

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
def check_out(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    user = get_user_from_token(db, _token_from_header(authorization))
    attendance = create_check_out(db, user)
    return {
        "message": "Check Out Successful",
        "attendance_id": attendance.id,
        "working_minutes": attendance.working_minutes,
    }


@router.get("")
def list_my_attendance(authorization: str | None = Header(default=None, alias="Authorization"), db: Session = Depends(get_db)):
    user = get_user_from_token(db, _token_from_header(authorization))
    records = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id)
        .order_by(Attendance.date.desc())
        .all()
    )
    return [
        {
            "date": record.date,
            "check_in": record.check_in,
            "check_out": record.check_out,
            "working_minutes": record.working_minutes,
            "status": record.status,
            "remarks": record.remarks,
        }
        for record in records
    ]


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
