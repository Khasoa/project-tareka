from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.user import User


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    reward_tokens_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reward_kes_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reward_sats_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    headquarters_location_id: Mapped[str | None] = mapped_column(
        ForeignKey("locations.id"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    staff_users: Mapped[list["User"]] = relationship(back_populates="company")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="company")
    headquarters_location: Mapped["Location | None"] = relationship(
        "Location",
        foreign_keys=[headquarters_location_id],
        back_populates="companies",
    )
