from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.utils.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    company_id: Mapped[str | None] = mapped_column(ForeignKey("companies.id"), index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(String(14), default=UserRole.recycler, nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(2), default="en", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company: Mapped["Company | None"] = relationship(
        "Company", foreign_keys=[company_id], back_populates="staff_users"
    )
    assigned_site: Mapped["Site | None"] = relationship(
        "Site",
        primaryjoin="User.id==Site.operator_id",
        foreign_keys="Site.operator_id",
        uselist=False,
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="actor_user")
    wallets: Mapped[list["Wallet"]] = relationship(back_populates="user")
    recycler_dropoffs: Mapped[list["Dropoff"]] = relationship(
        "Dropoff", foreign_keys="Dropoff.recycler_id", back_populates="recycler"
    )
    operator_dropoffs: Mapped[list["Dropoff"]] = relationship(
        "Dropoff", foreign_keys="Dropoff.operator_id", back_populates="operator"
    )
    payout_ledgers: Mapped[list["PayoutLedger"]] = relationship(back_populates="user")
    sat_payouts: Mapped[list["SatPayout"]] = relationship(back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
