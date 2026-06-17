from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class SatPayout(Base):
    __tablename__ = "sat_payouts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    dropoff_id: Mapped[str | None] = mapped_column(ForeignKey("dropoffs.id"), index=True, nullable=True)
    sats_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payout_rail: Mapped[str | None] = mapped_column(String(32), nullable=True)
    issuance_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(7), nullable=False)
    external_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company: Mapped["Company"] = relationship(foreign_keys=[company_id])
    user: Mapped["User"] = relationship(back_populates="sat_payouts")
