"""allow multiple print jobs per target

Revision ID: 0004_order_print_targets
Revises: 0003_operational_panels
Create Date: 2026-03-31
"""

import sqlalchemy as sa
from alembic import op


revision = "0004_order_print_targets"
down_revision = "0003_operational_panels"
branch_labels = None
depends_on = None

TABLE_NAME = "order_print_jobs"
OLD_UNIQUE_COLUMNS = ("company_id", "order_id", "trigger_status")
NEW_UNIQUE_COLUMNS = ("company_id", "order_id", "trigger_status", "printer_target")
NEW_UNIQUE_NAME = "uq_order_print_jobs_status_target"


def _unique_constraints_by_columns() -> dict[tuple[str, ...], str | None]:
    inspector = sa.inspect(op.get_bind())
    constraints: dict[tuple[str, ...], str | None] = {}
    for constraint in inspector.get_unique_constraints(TABLE_NAME):
        columns = tuple(constraint.get("column_names") or ())
        constraints[columns] = constraint.get("name")
    return constraints


def _drop_unique_constraint(name: str) -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table(TABLE_NAME) as batch_op:
            batch_op.drop_constraint(name, type_="unique")
        return

    op.drop_constraint(name, TABLE_NAME, type_="unique")


def _create_unique_constraint(name: str, columns: tuple[str, ...]) -> None:
    bind = op.get_bind()
    if bind.dialect.name == "sqlite":
        with op.batch_alter_table(TABLE_NAME) as batch_op:
            batch_op.create_unique_constraint(name, list(columns))
        return

    op.create_unique_constraint(name, TABLE_NAME, list(columns))


def upgrade() -> None:
    constraints = _unique_constraints_by_columns()
    old_constraint_name = constraints.get(OLD_UNIQUE_COLUMNS)
    new_constraint_exists = NEW_UNIQUE_COLUMNS in constraints

    if old_constraint_name:
        _drop_unique_constraint(old_constraint_name)

    if not new_constraint_exists:
        _create_unique_constraint(NEW_UNIQUE_NAME, NEW_UNIQUE_COLUMNS)


def downgrade() -> None:
    constraints = _unique_constraints_by_columns()
    new_constraint_name = constraints.get(NEW_UNIQUE_COLUMNS)
    old_constraint_exists = OLD_UNIQUE_COLUMNS in constraints

    if new_constraint_name:
        _drop_unique_constraint(new_constraint_name)

    if not old_constraint_exists:
        _create_unique_constraint("uq_order_print_jobs_status", OLD_UNIQUE_COLUMNS)
