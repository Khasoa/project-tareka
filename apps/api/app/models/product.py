from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.company import Company


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    material_story: Mapped[str | None] = mapped_column(Text, nullable=True)

    materials_used: Mapped[list | None] = mapped_column(JSON, nullable=True)
    product_story: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Informational only — no checkout/payment
    price_kes: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    token_requirement: Mapped[int | None] = mapped_column(Integer, nullable=True)
    token_discount_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    is_redeemable: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, server_default="false"
    )
    is_discountable: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, server_default="false"
    )

    availability: Mapped[list | None] = mapped_column(JSON, nullable=True)

    is_published: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True, server_default="false"
    )

    # ai_assisted: content was created with AI assistance
    # human_reviewed: AI-assisted content has been reviewed before public display
    ai_assisted: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, server_default="false"
    )
    human_reviewed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, server_default="false"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company: Mapped["Company"] = relationship("Company", back_populates="products")
