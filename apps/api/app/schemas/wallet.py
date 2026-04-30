from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class WalletResponse(BaseModel):
    id: str
    user_id: str
    company_id: str
    token_balance: Decimal
    lifetime_earned: Decimal
    lifetime_redeemed: Decimal


class TokenRedeemRequest(BaseModel):
    wallet_id: str = Field(min_length=1, max_length=36)
    amount: Decimal = Field(gt=0)
