"""sats reward rails, issuance metadata, recycler payout preferences

Revision ID: f1a2b3c4d5e6
Revises: e5f6a7b8c9d0
Create Date: 2026-05-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "f1a2b3c4d5e6"
down_revision = "e5f6a7b8c9d0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("companies", sa.Column("sats_reward_rail", sa.String(length=32), nullable=True))
    op.add_column(
        "companies",
        sa.Column("sats_reward_config", sa.JSON(), nullable=True),
    )

    op.add_column(
        "users",
        sa.Column("sats_payout_preferences", sa.JSON(), nullable=True),
    )

    op.add_column("sat_payouts", sa.Column("payout_rail", sa.String(length=32), nullable=True))
    op.add_column(
        "sat_payouts",
        sa.Column("issuance_metadata", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("sat_payouts", "issuance_metadata")
    op.drop_column("sat_payouts", "payout_rail")

    op.drop_column("users", "sats_payout_preferences")

    op.drop_column("companies", "sats_reward_config")
    op.drop_column("companies", "sats_reward_rail")
