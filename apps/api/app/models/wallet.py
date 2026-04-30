from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Wallet(Base):
    __tablename__ = "wallets"
    __table_args__ = (UniqueConstraint("user_id", "company_id", name="uq_wallet_user_company"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    token_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    lifetime_earned: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    lifetime_redeemed: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="wallets")
    company: Mapped["Company"] = relationship(foreign_keys=[company_id])
    transactions: Mapped[list["RewardTransaction"]] = relationship(back_populates="wallet")
