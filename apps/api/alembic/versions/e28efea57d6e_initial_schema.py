"""initial schema bootstrap for fresh PostgreSQL databases

Revision ID: e28efea57d6e
Revises:
Create Date: 2026-04-30
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "e28efea57d6e"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    if not insp.has_table("companies"):
        op.create_table(
            "companies",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("slug", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("reward_tokens_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("reward_kes_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("reward_sats_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("name"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index("ix_companies_id", "companies", ["id"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("full_name", sa.String(length=120), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=True),
            sa.Column("phone", sa.String(length=30), nullable=True),
            sa.Column("hashed_password", sa.String(length=255), nullable=True),
            sa.Column("role", sa.String(length=14), nullable=False, server_default="recycler"),
            sa.Column("language", sa.String(length=2), nullable=False, server_default="en"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
            sa.UniqueConstraint("phone"),
        )
        op.create_index("ix_users_id", "users", ["id"], unique=False)
        op.create_index("ix_users_role", "users", ["role"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("sites"):
        op.create_table(
            "sites",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("company_id", sa.String(length=36), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("address", sa.String(length=255), nullable=False),
            sa.Column("city", sa.String(length=120), nullable=False),
            sa.Column("latitude", sa.Numeric(precision=10, scale=7), nullable=False),
            sa.Column("longitude", sa.Numeric(precision=10, scale=7), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_sites_id", "sites", ["id"], unique=False)
        op.create_index("ix_sites_company_id", "sites", ["company_id"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("dropoffs"):
        op.create_table(
            "dropoffs",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("site_id", sa.String(length=36), nullable=False),
            sa.Column("company_id", sa.String(length=36), nullable=False),
            sa.Column("recycler_id", sa.String(length=36), nullable=False),
            sa.Column("operator_id", sa.String(length=36), nullable=False),
            sa.Column("material_type", sa.String(length=14), nullable=False),
            sa.Column("item_count", sa.Integer(), nullable=False),
            sa.Column("estimated_weight_kg", sa.Numeric(precision=12, scale=3), nullable=True),
            sa.Column("co2_avoided_kg", sa.Numeric(precision=12, scale=3), nullable=True),
            sa.Column("reward_type", sa.String(length=6), nullable=False),
            sa.Column("reward_amount", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0"),
            sa.Column("reward_issued", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("previous_hash", sa.String(length=255), nullable=True),
            sa.Column("record_hash", sa.String(length=255), nullable=True),
            sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["site_id"], ["sites.id"]),
            sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
            sa.ForeignKeyConstraint(["recycler_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["operator_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_dropoffs_id", "dropoffs", ["id"], unique=False)
        op.create_index("ix_dropoffs_site_id", "dropoffs", ["site_id"], unique=False)
        op.create_index("ix_dropoffs_company_id", "dropoffs", ["company_id"], unique=False)
        op.create_index("ix_dropoffs_recycler_id", "dropoffs", ["recycler_id"], unique=False)
        op.create_index("ix_dropoffs_operator_id", "dropoffs", ["operator_id"], unique=False)
        op.create_index("ix_dropoffs_material_type", "dropoffs", ["material_type"], unique=False)
        op.create_index("ix_dropoffs_confirmed_at", "dropoffs", ["confirmed_at"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("wallets"):
        op.create_table(
            "wallets",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=36), nullable=False),
            sa.Column("company_id", sa.String(length=36), nullable=False),
            sa.Column("token_balance", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0"),
            sa.Column("lifetime_earned", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0"),
            sa.Column("lifetime_redeemed", sa.Numeric(precision=12, scale=2), nullable=False, server_default="0"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("user_id", "company_id", name="uq_wallet_user_company"),
        )
        op.create_index("ix_wallets_id", "wallets", ["id"], unique=False)
        op.create_index("ix_wallets_user_id", "wallets", ["user_id"], unique=False)
        op.create_index("ix_wallets_company_id", "wallets", ["company_id"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("reward_transactions"):
        op.create_table(
            "reward_transactions",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("wallet_id", sa.String(length=36), nullable=False),
            sa.Column("dropoff_id", sa.String(length=36), nullable=True),
            sa.Column("reward_type", sa.String(length=6), nullable=False),
            sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["wallet_id"], ["wallets.id"]),
            sa.ForeignKeyConstraint(["dropoff_id"], ["dropoffs.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_reward_transactions_id", "reward_transactions", ["id"], unique=False)
        op.create_index("ix_reward_transactions_wallet_id", "reward_transactions", ["wallet_id"], unique=False)
        op.create_index("ix_reward_transactions_dropoff_id", "reward_transactions", ["dropoff_id"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("audit_logs"):
        op.create_table(
            "audit_logs",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("actor_user_id", sa.String(length=36), nullable=True),
            sa.Column("action", sa.String(length=255), nullable=False),
            sa.Column("entity_type", sa.String(length=120), nullable=False),
            sa.Column("entity_id", sa.String(length=36), nullable=False),
            sa.Column("metadata_json", sa.JSON(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_audit_logs_id", "audit_logs", ["id"], unique=False)
        op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("sat_payouts"):
        op.create_table(
            "sat_payouts",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=36), nullable=False),
            sa.Column("company_id", sa.String(length=36), nullable=False),
            sa.Column("dropoff_id", sa.String(length=36), nullable=True),
            sa.Column("sats_amount", sa.Integer(), nullable=False),
            sa.Column("status", sa.String(length=7), nullable=False),
            sa.Column("external_reference", sa.String(length=255), nullable=True),
            sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
            sa.ForeignKeyConstraint(["dropoff_id"], ["dropoffs.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_sat_payouts_id", "sat_payouts", ["id"], unique=False)
        op.create_index("ix_sat_payouts_user_id", "sat_payouts", ["user_id"], unique=False)
        op.create_index("ix_sat_payouts_company_id", "sat_payouts", ["company_id"], unique=False)
        op.create_index("ix_sat_payouts_dropoff_id", "sat_payouts", ["dropoff_id"], unique=False)

    insp = sa.inspect(bind)
    if not insp.has_table("payout_ledgers"):
        op.create_table(
            "payout_ledgers",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("company_id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=36), nullable=False),
            sa.Column("amount_kes", sa.Numeric(precision=12, scale=2), nullable=False),
            sa.Column("status", sa.String(length=14), nullable=False),
            sa.Column("due_date", sa.DateTime(timezone=True), nullable=False),
            sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_payout_ledgers_id", "payout_ledgers", ["id"], unique=False)
        op.create_index("ix_payout_ledgers_company_id", "payout_ledgers", ["company_id"], unique=False)
        op.create_index("ix_payout_ledgers_user_id", "payout_ledgers", ["user_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    for table in (
        "payout_ledgers",
        "sat_payouts",
        "audit_logs",
        "reward_transactions",
        "wallets",
        "dropoffs",
        "sites",
        "users",
        "companies",
    ):
        if insp.has_table(table):
            op.drop_table(table)
