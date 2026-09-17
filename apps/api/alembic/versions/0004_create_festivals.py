"""create festivals table

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-17
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ZONES = ("gyeongpo", "city", "daegwallyeong", "jumunjin", "jeongdongjin")


def upgrade() -> None:
    op.create_table(
        "festivals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=60), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("tagline", sa.String(length=200), nullable=False),
        # 음력 기준 축제가 있어 날짜로 정규화하지 않고 표시 문구를 그대로 둔다
        sa.Column("when_label", sa.String(length=80), nullable=False),
        sa.Column("badge", sa.String(length=20), nullable=True),
        sa.Column("is_now", sa.Boolean(), server_default="0", nullable=False),
        sa.Column(
            "zone",
            sa.Enum(*ZONES, native_enum=False, length=20, name="zone"),
            nullable=False,
        ),
        sa.Column("zone_label", sa.String(length=40), nullable=True),
        sa.Column("place", sa.String(length=200), nullable=False),
        sa.Column("about", sa.Text(), nullable=False),
        sa.Column("hours", sa.String(length=200), nullable=True),
        sa.Column("price", sa.String(length=120), nullable=True),
        sa.Column("tip", sa.Text(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lng", sa.Float(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_festivals_slug", "festivals", ["slug"], unique=True)
    op.create_index("ix_festivals_zone", "festivals", ["zone"])


def downgrade() -> None:
    op.drop_table("festivals")
