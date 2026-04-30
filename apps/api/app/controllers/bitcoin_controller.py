from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, require_role
from app.db.session import get_db
from app.models.sat_payout import SatPayout
from app.models.user import User
from app.services.bitcoin_service import trigger_sat_payout
from app.utils.enums import UserRole

router = APIRouter(prefix="/bitcoin", tags=["bitcoin"])


@router.post("/payout/{sat_payout_id}")
def trigger_payout_endpoint(
    sat_payout_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("company_admin", "platform_admin")),
):
    payout = db.scalars(select(SatPayout).where(SatPayout.id == sat_payout_id)).first()
    if not payout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sat payout not found")

    if current_user.role == UserRole.company_admin and payout.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    sent = trigger_sat_payout(db, payout)
    return {
        "sat_payout_id": payout.id,
        "status": payout.status,
        "sent": sent,
        "attempt_count": payout.attempt_count,
    }


@router.get("/history/{user_id}")
def payout_history(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == UserRole.recycler and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    stmt = select(SatPayout).where(SatPayout.user_id == user_id)
    if current_user.role == UserRole.company_admin:
        stmt = stmt.where(SatPayout.company_id == current_user.company_id)

    if current_user.role not in {UserRole.recycler, UserRole.company_admin, UserRole.platform_admin}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    rows = db.scalars(stmt.order_by(SatPayout.created_at.desc()).limit(100)).all()
    return [
        {
            "id": r.id,
            "company_id": r.company_id,
            "sats_amount": r.sats_amount,
            "status": r.status,
            "attempt_count": r.attempt_count,
            "sent_at": r.sent_at,
            "created_at": r.created_at,
        }
        for r in rows
    ]
