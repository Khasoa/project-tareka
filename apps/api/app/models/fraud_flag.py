from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin
from app.utils.enums import FraudStatus


class FraudFlag(Base, TimestampUUIDMixin):
    __tablename__ = "fraud_flags"

    dropoff_id: Mapped[str | None] = mapped_column(ForeignKey("dropoffs.id"), index=True, nullable=True)
    reviewer_user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=True
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[FraudStatus] = mapped_column(
        Enum(FraudStatus, name="fraud_status_enum"),
        default=FraudStatus.open,
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    dropoff: Mapped["Dropoff | None"] = relationship(back_populates="fraud_flags")
    reviewer_user: Mapped["User | None"] = relationship(
        "User",
        back_populates="reviewed_fraud_flags",
        foreign_keys=[reviewer_user_id],
    )
