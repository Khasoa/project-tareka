from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Dropoff(Base):
    __tablename__ = "dropoffs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    site_id: Mapped[str] = mapped_column(ForeignKey("sites.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    recycler_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    operator_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    material_type: Mapped[str] = mapped_column(String(14), index=True, nullable=False)
    item_count: Mapped[int] = mapped_column(nullable=False)
    estimated_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(12, 3), nullable=True)
    co2_avoided_kg: Mapped[Decimal | None] = mapped_column(Numeric(12, 3), nullable=True)
    client_reference_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    reward_type: Mapped[str] = mapped_column(String(6), nullable=False)
    reward_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    reward_issued: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    previous_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    record_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    confirmed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    site: Mapped["Site"] = relationship(back_populates="dropoffs")
    company: Mapped["Company"] = relationship(foreign_keys=[company_id])
    recycler: Mapped["User"] = relationship(
        "User", foreign_keys=[recycler_id], back_populates="recycler_dropoffs"
    )
    operator: Mapped["User"] = relationship(
        "User", foreign_keys=[operator_id], back_populates="operator_dropoffs"
    )
    reward_transactions: Mapped[list["RewardTransaction"]] = relationship(back_populates="dropoff")
