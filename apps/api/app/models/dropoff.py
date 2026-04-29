from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin
from app.utils.enums import MaterialType, RewardType


class Dropoff(Base, TimestampUUIDMixin):
    __tablename__ = "dropoffs"

    site_id: Mapped[str] = mapped_column(ForeignKey("sites.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    recycler_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    operator_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    material_type: Mapped[MaterialType] = mapped_column(
        Enum(MaterialType, name="material_type_enum"), nullable=False, index=True
    )
    item_count: Mapped[int] = mapped_column(default=1, nullable=False)

    estimated_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(12, 3), nullable=True)
    co2_avoided_kg: Mapped[Decimal | None] = mapped_column(Numeric(12, 3), nullable=True)

    reward_type: Mapped[RewardType] = mapped_column(
        Enum(RewardType, name="reward_type_enum"), nullable=False
    )
    reward_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    reward_issued: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    previous_hash: Mapped[str | None] = mapped_column(nullable=True)
    record_hash: Mapped[str | None] = mapped_column(nullable=True)

    confirmed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    site: Mapped["Site"] = relationship(back_populates="dropoffs")
    company: Mapped["Company"] = relationship(back_populates="dropoffs")
    recycler: Mapped["User"] = relationship(
        "User", back_populates="recycler_dropoffs", foreign_keys=[recycler_id]
    )
    operator: Mapped["User"] = relationship(
        "User", back_populates="operator_dropoffs", foreign_keys=[operator_id]
    )
    transactions: Mapped[list["RewardTransaction"]] = relationship(back_populates="dropoff")
    fraud_flags: Mapped[list["FraudFlag"]] = relationship(back_populates="dropoff")
