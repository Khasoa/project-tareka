from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.company import Company


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)
    operator_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company: Mapped["Company"] = relationship(foreign_keys=[company_id])
    operator: Mapped["User | None"] = relationship(
        "User", foreign_keys=[operator_id], back_populates="assigned_site"
    )
    dropoffs: Mapped[list["Dropoff"]] = relationship(back_populates="site")
