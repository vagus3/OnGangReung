"""Align existing enum data with the lowercase migration/API values.

SQLAlchemy previously persisted Python member names (GYEONGPO/STD), while
the migrations and server defaults use values (gyeongpo/std). Deploy this
migration together with the updated models; old app workers must be stopped.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0008"
down_revision: str | None = "0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COLUMNS = {"spots": ("zone", "category", "span", "rail"), "festivals": ("zone",)}


def upgrade() -> None:
    for table, columns in COLUMNS.items():
        for column in columns:
            op.execute(sa.text(f"UPDATE {table} SET {column} = lower({column})"))


def downgrade() -> None:
    for table, columns in COLUMNS.items():
        for column in columns:
            op.execute(sa.text(f"UPDATE {table} SET {column} = upper({column})"))
