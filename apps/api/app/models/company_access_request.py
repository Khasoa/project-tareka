from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class CompanyAccessRequest(Base):
    __tablename__ = "company_access_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(120), nullable=False)
    work_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    industry: Mapped[str] = mapped_column(String(100), nullable=False)
    optional_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    # pending_approval | approved | rejected
    status: Mapped[str] = mapped_column(String(20), default="pending_approval", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
