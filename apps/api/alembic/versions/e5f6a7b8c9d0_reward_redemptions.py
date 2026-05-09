"""add reward_redemptions for marketplace fulfilment audit

Revision ID: e5f6a7b8c9d0
Revises: d7e8f9a0b1c2
Create Date: 2026-05-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "e5f6a7b8c9d0"
down_revision = "d7e8f9a0b1c2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reward_redemptions",
        sa.Column("id", sa.String(36), primary_key=True, nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("wallet_id", sa.String(36), sa.ForeignKey("wallets.id"), nullable=False),
        sa.Column("company_id", sa.String(36), sa.ForeignKey("companies.id"), nullable=False),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("tokens_spent", sa.Numeric(12, 2), nullable=False),
        sa.Column("instructions_snapshot", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_reward_redemptions_user_id", "reward_redemptions", ["user_id"])
    op.create_index("ix_reward_redemptions_product_id", "reward_redemptions", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_reward_redemptions_product_id", table_name="reward_redemptions")
    op.drop_index("ix_reward_redemptions_user_id", table_name="reward_redemptions")
    op.drop_table("reward_redemptions")
