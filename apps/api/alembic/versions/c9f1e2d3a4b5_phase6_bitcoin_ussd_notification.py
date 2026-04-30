"""phase6 bitcoin ussd notification

Revision ID: c9f1e2d3a4b5
Revises: b7d8e9f0a1b2
Create Date: 2026-04-30
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "c9f1e2d3a4b5"
down_revision = "b7d8e9f0a1b2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    sat_cols = {c["name"] for c in inspector.get_columns("sat_payouts")}
    if "attempt_count" not in sat_cols:
        op.add_column("sat_payouts", sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"))
        op.alter_column("sat_payouts", "attempt_count", server_default=None)
    if "failure_reason" not in sat_cols:
        op.add_column("sat_payouts", sa.Column("failure_reason", sa.String(length=255), nullable=True))
    if "last_attempt_at" not in sat_cols:
        op.add_column("sat_payouts", sa.Column("last_attempt_at", sa.DateTime(timezone=True), nullable=True))

    if not inspector.has_table("notifications"):
        op.create_table(
            "notifications",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("user_id", sa.String(length=36), nullable=False),
            sa.Column("channel", sa.String(length=20), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("is_sent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    op.execute("CREATE INDEX IF NOT EXISTS ix_notifications_id ON notifications (id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_notifications_user_id")
    op.execute("DROP INDEX IF EXISTS ix_notifications_id")
    op.execute("DROP TABLE IF EXISTS notifications")

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    sat_cols = {c["name"] for c in inspector.get_columns("sat_payouts")}
    if "last_attempt_at" in sat_cols:
        op.drop_column("sat_payouts", "last_attempt_at")
    if "failure_reason" in sat_cols:
        op.drop_column("sat_payouts", "failure_reason")
    if "attempt_count" in sat_cols:
        op.drop_column("sat_payouts", "attempt_count")
