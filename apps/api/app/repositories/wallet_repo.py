from __future__ import annotations

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.wallet import Wallet


class WalletRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_company(self, user_id: str, company_id: str) -> Wallet | None:
        stmt = select(Wallet).where(Wallet.user_id == user_id, Wallet.company_id == company_id)
        return self.db.scalars(stmt).first()

    def create_wallet(self, user_id: str, company_id: str) -> Wallet:
        wallet = Wallet(
            id=str(uuid4()),
            user_id=user_id,
            company_id=company_id,
        )
        self.db.add(wallet)
        self.db.flush()
        return wallet

    def get_by_id(self, wallet_id: str) -> Wallet | None:
        stmt = select(Wallet).where(Wallet.id == wallet_id)
        return self.db.scalars(stmt).first()
