from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.product import Product
    from app.models.user import User
    from app.models.wallet import Wallet


class RewardRedemption(Base):
    """Recorded marketplace redemptions tied to recycler wallets."""

    __tablename__ = "reward_redemptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True, nullable=False)

    tokens_spent: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    instructions_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    wallet: Mapped["Wallet"] = relationship(foreign_keys=[wallet_id])
    company: Mapped["Company"] = relationship(foreign_keys=[company_id])
    product: Mapped["Product"] = relationship(foreign_keys=[product_id])
