from __future__ import annotations

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.db.base_class import Base, TimestampUUIDMixin
from app.utils.enums import LanguageCode, UserRole


class User(Base, TimestampUUIDMixin):
    __tablename__ = "users"

    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), unique=True, index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum"), nullable=False, index=True
    )
    language: Mapped[LanguageCode] = mapped_column(
        Enum(LanguageCode, name="language_code_enum"),
        default=LanguageCode.en,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    wallets: Mapped[list["Wallet"]] = relationship(back_populates="user")
    recycler_dropoffs: Mapped[list["Dropoff"]] = relationship(
        "Dropoff",
        back_populates="recycler",
        foreign_keys="Dropoff.recycler_id",
    )
    operator_dropoffs: Mapped[list["Dropoff"]] = relationship(
        "Dropoff",
        back_populates="operator",
        foreign_keys="Dropoff.operator_id",
    )
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="actor_user"
    )
    reviewed_fraud_flags: Mapped[list["FraudFlag"]] = relationship(
        "FraudFlag",
        back_populates="reviewer_user",
        foreign_keys="FraudFlag.reviewer_user_id",
    )
    payout_ledgers: Mapped[list["PayoutLedger"]] = relationship(back_populates="user")
    sat_payouts: Mapped[list["SatPayout"]] = relationship(back_populates="user")
