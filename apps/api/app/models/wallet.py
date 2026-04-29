from __future__ import annotations

from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin


class Wallet(Base, TimestampUUIDMixin):
    __tablename__ = "wallets"
    __table_args__ = (UniqueConstraint("user_id", "company_id", name="uq_wallet_user_company"),)

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    token_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    lifetime_earned: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    lifetime_redeemed: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)

    user: Mapped["User"] = relationship(back_populates="wallets")
    company: Mapped["Company"] = relationship(back_populates="wallets")
    transactions: Mapped[list["RewardTransaction"]] = relationship(back_populates="wallet")
