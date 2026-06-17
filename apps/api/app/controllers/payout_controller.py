from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.access import authorize_company_access
from app.db.session import get_db
from app.models.user import User
from app.schemas.payout import MarkPaidRequest, PayoutLedgerResponse
from app.services.payout_service import get_weekly_report, mark_paid

router = APIRouter(prefix="/payouts/company", tags=["payouts"])


@router.get("/{company_id}/weekly", response_model=list[PayoutLedgerResponse])
def weekly_payouts(
    company_id: str,
    week_of: date = Query(..., description="Any date within the target ISO week (UTC)"),
    db: Session = Depends(get_db),
    _: User = Depends(authorize_company_access),
):
    rows = get_weekly_report(db, company_id, week_of)
    return [
        PayoutLedgerResponse(
            id=r.id,
            company_id=r.company_id,
            user_id=r.user_id,
            amount_kes=r.amount_kes,
            status=r.status,
            due_date=r.due_date,
            paid_at=r.paid_at,
        )
        for r in rows
    ]


@router.post("/{company_id}/mark-paid")
def mark_paid_endpoint(
    company_id: str,
    body: MarkPaidRequest,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_company_access),
):
    updated = mark_paid(db, company_id, body.recycler_ids, body.week_of)
    return {"updated": updated}
