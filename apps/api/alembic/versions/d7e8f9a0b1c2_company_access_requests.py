"""add company_access_requests table

Revision ID: d7e8f9a0b1c2
Revises: c3d4e5f6a7b8
Create Date: 2026-05-07
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "d7e8f9a0b1c2"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "company_access_requests",
        sa.Column("id", sa.String(36), primary_key=True, index=True, nullable=False),
        sa.Column("company_name", sa.String(200), nullable=False),
        sa.Column("contact_person", sa.String(120), nullable=False),
        sa.Column("work_email", sa.String(255), nullable=False, index=True),
        sa.Column("industry", sa.String(100), nullable=False),
        sa.Column("optional_message", sa.Text, nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending_approval", index=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("company_access_requests")
