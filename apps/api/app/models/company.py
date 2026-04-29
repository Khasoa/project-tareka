from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin


class Company(Base, TimestampUUIDMixin):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    reward_tokens_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reward_kes_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reward_sats_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sites: Mapped[list["Site"]] = relationship(back_populates="company")
    wallets: Mapped[list["Wallet"]] = relationship(back_populates="company")
    dropoffs: Mapped[list["Dropoff"]] = relationship(back_populates="company")
    products: Mapped[list["Product"]] = relationship(back_populates="company")
    payout_ledgers: Mapped[list["PayoutLedger"]] = relationship(back_populates="company")
    sat_payouts: Mapped[list["SatPayout"]] = relationship(back_populates="company")
