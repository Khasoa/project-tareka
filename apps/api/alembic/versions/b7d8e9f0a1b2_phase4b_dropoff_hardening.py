"""phase4b dropoff hardening: client ref, indexes

Revision ID: b7d8e9f0a1b2
Revises: f4c2a1b8d7e6
Create Date: 2026-04-30
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "b7d8e9f0a1b2"
down_revision = "f4c2a1b8d7e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "dropoffs",
        sa.Column("client_reference_id", sa.String(length=128), nullable=True),
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_dropoffs_company_client_ref
        ON dropoffs (company_id, client_reference_id)
        WHERE client_reference_id IS NOT NULL
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_dropoffs_company_confirmed_at_desc
        ON dropoffs (company_id, confirmed_at DESC)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_dropoffs_company_confirmed_at_desc")
    op.execute("DROP INDEX IF EXISTS uq_dropoffs_company_client_ref")
    op.drop_column("dropoffs", "client_reference_id")
