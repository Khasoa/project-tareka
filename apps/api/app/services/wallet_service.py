from __future__ import annotations

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.wallet_repo import WalletRepository


class WalletService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WalletRepository(db)

    def get_wallet(self, user_id: str, company_id: str):
        wallet = self.repo.get_by_user_company(user_id, company_id)
        if not wallet:
            return None
        return wallet

    def create_wallet_if_missing(self, user_id: str, company_id: str):
        wallet = self.repo.get_by_user_company(user_id, company_id)
        if wallet:
            return wallet
        return self.repo.create_wallet(user_id, company_id)

    def add_tokens(self, wallet, amount: Decimal, dropoff_id: str | None) -> None:
        wallet.token_balance += amount
        wallet.lifetime_earned += amount

    def redeem_tokens(self, wallet, amount: Decimal) -> None:
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive",
            )
        if wallet.token_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient token balance",
            )
        wallet.token_balance -= amount
        wallet.lifetime_redeemed += amount
