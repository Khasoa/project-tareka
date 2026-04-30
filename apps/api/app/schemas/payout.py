from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class PayoutLedgerResponse(BaseModel):
    id: str
    company_id: str
    user_id: str
    amount_kes: Decimal
    status: str
    due_date: datetime
    paid_at: datetime | None


class MarkPaidRequest(BaseModel):
    recycler_ids: list[str] = Field(min_length=1)
    week_of: date
