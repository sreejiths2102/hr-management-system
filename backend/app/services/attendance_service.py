from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import date, datetime, timezone
from typing import cast

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.user import User


JWT_SECRET = os.getenv("JWT_SECRET", "hrms-secret-key")


def _decode_token(token: str) -> dict:
    try:
        header_part, payload_part, signature_part = token.split(".")
        signing_input = f"{header_part}.{payload_part}".encode("ascii")
        expected_signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_signature = base64.urlsafe_b64decode(signature_part + "==")
        if not hmac.compare_digest(expected_signature, actual_signature):
            raise ValueError("Invalid signature")

        payload_json = base64.urlsafe_b64decode(payload_part + "==").decode("utf-8")
        payload = json.loads(payload_json)
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > float(exp):
            raise ValueError("Token expired")
        return payload
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def get_user_from_token(db: Session, token: str) -> User:
    payload = _decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def calculate_working_hours(check_in_time: datetime, check_out_time: datetime) -> str:
    total_seconds = int((check_out_time - check_in_time).total_seconds())
    hours, remainder = divmod(total_seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}"


def _has_approved_leave(db: Session, user: User, target_date: date) -> bool:
    return (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.user_id == user.id,
            LeaveRequest.status == "Approved",
            LeaveRequest.start_date <= target_date,
            LeaveRequest.end_date >= target_date,
        )
        .first()
        is not None
    )


def get_today_status(db: Session, user: User, target_date: date | None = None) -> str:
    attendance_date = target_date or date.today()
    if _has_approved_leave(db, user, attendance_date):
        return "leave"

    attendance = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id, Attendance.date == attendance_date)
        .first()
    )
    if attendance:
        return (attendance.status or "Present").lower().replace("half day", "half_day")

    return "absent"


def create_check_in(db: Session, user: User) -> Attendance:
    today = date.today()

    if _has_approved_leave(db, user, today):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Approved leave already exists for today")

    existing_attendance = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id, Attendance.date == today)
        .first()
    )
    if existing_attendance:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attendance already marked for today")

    attendance = Attendance(
        user_id=user.id,
        date=today,
        check_in=datetime.now(timezone.utc),
        check_out=None,
        working_minutes=None,
        status="Present",
        remarks=None,
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


def create_check_out(db: Session, user: User) -> Attendance:
    today = date.today()
    attendance = (
        db.query(Attendance)
        .filter(Attendance.user_id == user.id, Attendance.date == today)
        .first()
    )
    if attendance is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Check-in not found for today")

    check_in_time = cast(datetime | None, attendance.check_in)
    if check_in_time is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Check-in not found for today")
    if cast(datetime | None, attendance.check_out) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked out")

    check_out_time = datetime.now(timezone.utc)
    setattr(attendance, "check_out", check_out_time)
    setattr(attendance, "working_minutes", int((check_out_time - check_in_time).total_seconds() // 60))
    db.commit()
    db.refresh(attendance)
    return attendance


def mark_leave_attendance(db: Session, leave_request: LeaveRequest) -> None:
    user = db.query(User).filter(User.id == leave_request.user_id).first()
    if not user:
        return

    current_date = cast(date, leave_request.start_date)
    end_date = cast(date, leave_request.end_date)
    while current_date <= end_date:
        attendance = (
            db.query(Attendance)
            .filter(Attendance.user_id == user.id, Attendance.date == current_date)
            .first()
        )
        if attendance:
            setattr(attendance, "status", "Leave")
            setattr(attendance, "remarks", leave_request.reason or leave_request.leave_type)
        else:
            attendance = Attendance(
                user_id=user.id,
                date=current_date,
                check_in=None,
                check_out=None,
                working_minutes=None,
                status="Leave",
                remarks=leave_request.reason or leave_request.leave_type,
            )
            db.add(attendance)
        current_date = current_date.fromordinal(current_date.toordinal() + 1)

    db.commit()
