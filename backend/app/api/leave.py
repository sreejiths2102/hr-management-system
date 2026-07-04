from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.leave_request import LeaveRequest
from app.models.user import User
from app.services.attendance_service import get_user_from_token
from app.schemas.leave import LeaveCreate
from app.services.leave_service import approve_leave, cancel_leave_attendance, create_leave_request, reject_leave

router = APIRouter(prefix="/leave", tags=["Leave"])


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


@router.get("")
def list_leave_requests(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    query = db.query(LeaveRequest).filter(LeaveRequest.user_id == current_user.id)
    if current_user.role == "hr" or current_user.is_company_admin:
        query = db.query(LeaveRequest).join(User, User.id == LeaveRequest.user_id).filter(User.company_id == current_user.company_id)
    records = query.order_by(LeaveRequest.applied_at.desc()).all()
    return [
        {
            "id": record.id,
            "user_id": record.user_id,
            "leave_type": record.leave_type,
            "start_date": record.start_date,
            "end_date": record.end_date,
            "reason": record.reason,
            "status": record.status,
            "approved_by": record.approved_by,
            "admin_comment": record.admin_comment,
            "applied_at": record.applied_at,
            "decision_at": record.decision_at,
        }
        for record in records
    ]


@router.post("")
def apply_leave(
    payload: LeaveCreate,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    leave_request = create_leave_request(
        db,
        current_user=current_user,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
    )
    return {
        "message": "Leave applied",
        "leave_request_id": leave_request.id,
        "status": leave_request.status,
    }


@router.put("/{leave_request_id}/approve")
def approve_leave_request(
    leave_request_id: int,
    admin_comment: str | None = None,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    admin_user = get_user_from_token(db, _token_from_header(authorization))
    if admin_user.role != "hr" and not admin_user.is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")
    leave_request = approve_leave(db, leave_request_id, admin_user, admin_comment)
    return {"message": "Leave approved", "leave_request_id": leave_request.id}


@router.put("/{leave_request_id}/reject")
def reject_leave_request(
    leave_request_id: int,
    admin_comment: str | None = None,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    admin_user = get_user_from_token(db, _token_from_header(authorization))
    if admin_user.role != "hr" and not admin_user.is_company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR access required")
    leave_request = reject_leave(db, leave_request_id, admin_user, admin_comment)
    return {"message": "Leave rejected", "leave_request_id": leave_request.id}


@router.put("/{leave_request_id}/cancel")
def cancel_leave_request(
    leave_request_id: int,
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    current_user = get_user_from_token(db, _token_from_header(authorization))
    leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == leave_request_id).first()
    if not leave_request or leave_request.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

    setattr(leave_request, "status", "Cancelled")
    db.commit()
    db.refresh(leave_request)
    cancel_leave_attendance(db, leave_request)
    return {"message": "Leave cancelled", "leave_request_id": leave_request.id}
