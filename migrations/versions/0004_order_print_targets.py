"""allow multiple print jobs per target

Revision ID: 0004_order_print_targets
Revises: 0003_operational_panels
Create Date: 2026-03-31
"""

from alembic import op


revision = "0004_order_print_targets"
down_revision = "0003_operational_panels"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("uq_order_print_jobs_status", "order_print_jobs", type_="unique")
    op.create_unique_constraint(
        "uq_order_print_jobs_status_target",
        "order_print_jobs",
        ["company_id", "order_id", "trigger_status", "printer_target"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_order_print_jobs_status_target", "order_print_jobs", type_="unique")
    op.create_unique_constraint(
        "uq_order_print_jobs_status",
        "order_print_jobs",
        ["company_id", "order_id", "trigger_status"],
    )
