from datetime import date, datetime, timezone
from typing import cast

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.user import User
from app.services.attendance_service import mark_leave_attendance


def create_leave_request(db: Session, current_user: User, leave_type: str, start_date: date, end_date: date, reason: str | None = None) -> LeaveRequest:
    leave_request = LeaveRequest(
        user_id=current_user.id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        status="Pending",
    )
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    return leave_request


def create_leave_attendance(db: Session, leave_request: LeaveRequest) -> None:
    mark_leave_attendance(db, leave_request)


def approve_leave(db: Session, leave_request_id: int, admin_user: User, admin_comment: str | None = None) -> LeaveRequest:
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_request_id).first()
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

    setattr(leave_request, "status", "Approved")
    setattr(leave_request, "approved_by", admin_user.id)
    setattr(leave_request, "admin_comment", admin_comment)
    setattr(leave_request, "decision_at", datetime.now(timezone.utc))
    db.commit()
    db.refresh(leave_request)

    create_leave_attendance(db, leave_request)
    return leave_request


def reject_leave(db: Session, leave_request_id: int, admin_user: User, admin_comment: str | None = None) -> LeaveRequest:
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_request_id).first()
    if not leave_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

    setattr(leave_request, "status", "Rejected")
    setattr(leave_request, "approved_by", admin_user.id)
    setattr(leave_request, "admin_comment", admin_comment)
    setattr(leave_request, "decision_at", datetime.now(timezone.utc))
    db.commit()
    db.refresh(leave_request)
    return leave_request


def cancel_leave_attendance(db: Session, leave_request: LeaveRequest) -> None:
    user = db.query(User).filter(User.id == leave_request.user_id).first()
    if not user:
        return

    start_date = cast(date, leave_request.start_date)
    end_date = cast(date, leave_request.end_date)
    current_date = start_date
    while current_date <= end_date:
        attendance = (
            db.query(Attendance)
            .filter(
                Attendance.user_id == user.id,
                Attendance.date == current_date,
                Attendance.status == "Leave",
            )
            .first()
        )
        if attendance:
            db.delete(attendance)
        current_date = date.fromordinal(current_date.toordinal() + 1)

    db.commit()
