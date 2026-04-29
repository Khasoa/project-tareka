from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin
from app.utils.enums import SatPayoutStatus


class SatPayout(Base, TimestampUUIDMixin):
    __tablename__ = "sat_payouts"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    dropoff_id: Mapped[str | None] = mapped_column(ForeignKey("dropoffs.id"), index=True, nullable=True)
    sats_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[SatPayoutStatus] = mapped_column(
        Enum(SatPayoutStatus, name="sat_payout_status_enum"),
        default=SatPayoutStatus.pending,
        nullable=False,
    )
    external_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="sat_payouts")
    company: Mapped["Company"] = relationship(back_populates="sat_payouts")
