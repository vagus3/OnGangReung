"""add themes, theme_spots and spot detail fields

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-17

테마 코스와, 장소 상세 화면에 필요한 편집 필드를 더한다.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 상세 화면용 편집 필드. 기존 행이 있을 수 있으므로 전부 nullable로 넣고,
    # menu는 빈 배열 기본값을 준다.
    op.add_column("spots", sa.Column("about", sa.Text(), nullable=True))
    op.add_column("spots", sa.Column("hours", sa.String(length=200), nullable=True))
    op.add_column("spots", sa.Column("tip", sa.Text(), nullable=True))
    op.add_column("spots", sa.Column("parking", sa.String(length=200), nullable=True))
    op.add_column(
        "spots",
        sa.Column("menu", sa.JSON(), nullable=False, server_default="[]"),
    )

    op.create_table(
        "themes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=40), nullable=False),
        sa.Column("name", sa.String(length=60), nullable=False),
        sa.Column("name_en", sa.String(length=60), nullable=False),
        sa.Column("tagline", sa.String(length=200), nullable=False),
        sa.Column("season", sa.String(length=40), nullable=False),
        sa.Column("car_note", sa.String(length=40), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_themes_slug", "themes", ["slug"], unique=True)

    op.create_table(
        "theme_spots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "theme_id",
            sa.Integer(),
            sa.ForeignKey("themes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "spot_id",
            sa.Integer(),
            sa.ForeignKey("spots.id", ondelete="CASCADE"),
            nullable=False,
        ),
        # 같은 장소가 테마마다 다른 문장으로 소개되므로 연결에 서술이 붙는다
        sa.Column("note", sa.String(length=200), nullable=False),
        sa.Column("hint", sa.String(length=60), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.UniqueConstraint("theme_id", "spot_id", name="uq_theme_spots"),
    )
    op.create_index("ix_theme_spots_theme_id", "theme_spots", ["theme_id"])
    op.create_index("ix_theme_spots_spot_id", "theme_spots", ["spot_id"])


def downgrade() -> None:
    op.drop_table("theme_spots")
    op.drop_table("themes")
    for column in ("menu", "parking", "tip", "hours", "about"):
        op.drop_column("spots", column)
