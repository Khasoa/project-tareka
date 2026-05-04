from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampUUIDMixin

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.site import Site


class Location(Base, TimestampUUIDMixin):
    __tablename__ = "locations"

    __table_args__ = (Index("ix_location_country_city", "country", "city"),)

    country: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    region: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    area: Mapped[str | None] = mapped_column(String(100), nullable=True)

    latitude: Mapped[float] = mapped_column(Float, index=True, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, index=True, nullable=False)

    formatted_address: Mapped[str | None] = mapped_column(String(255), nullable=True)

    sites: Mapped[list["Site"]] = relationship("Site", back_populates="location")
    companies: Mapped[list["Company"]] = relationship(
        "Company", back_populates="headquarters_location"
    )
