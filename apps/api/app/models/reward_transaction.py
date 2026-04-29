from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin
from app.utils.enums import RewardType


class RewardTransaction(Base, TimestampUUIDMixin):
    __tablename__ = "reward_transactions"

    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), index=True, nullable=False)
    dropoff_id: Mapped[str | None] = mapped_column(ForeignKey("dropoffs.id"), index=True, nullable=True)
    reward_type: Mapped[RewardType] = mapped_column(
        Enum(RewardType, name="reward_type_enum"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    wallet: Mapped["Wallet"] = relationship(back_populates="transactions")
    dropoff: Mapped["Dropoff | None"] = relationship(back_populates="transactions")
