"""create tour_contents and spots tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-14

외부 미러(tour_contents)와 편집 엔티티(spots)를 나눠 만든다. 동기화 잡은
tour_contents에만 쓰고 spots는 건드리지 않는다 — ADR 007.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ZONES = ("gyeongpo", "city", "daegwallyeong", "jumunjin", "jeongdongjin")
CATEGORIES = ("nature", "cafe", "history", "food", "downtown")
SPANS = ("std", "wide", "tall")
RAILS = ("beach", "food", "hot", "night")


def upgrade() -> None:
    op.create_table(
        "tour_contents",
        # TourAPI contentid가 그대로 PK다
        sa.Column("content_id", sa.String(length=20), primary_key=True),
        sa.Column("content_type_id", sa.String(length=10), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("addr1", sa.String(length=300), nullable=True),
        sa.Column("addr2", sa.String(length=200), nullable=True),
        sa.Column("zipcode", sa.String(length=10), nullable=True),
        sa.Column("area_code", sa.String(length=10), nullable=True),
        sa.Column("sigungu_code", sa.String(length=10), nullable=True),
        sa.Column("cat1", sa.String(length=10), nullable=True),
        sa.Column("cat2", sa.String(length=10), nullable=True),
        sa.Column("cat3", sa.String(length=10), nullable=True),
        # TourAPI mapx=경도, mapy=위도. 저장 시점에 이름을 바로잡는다
        sa.Column("lng", sa.Float(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("map_level", sa.String(length=5), nullable=True),
        sa.Column("tel", sa.String(length=100), nullable=True),
        sa.Column("homepage", sa.Text(), nullable=True),
        sa.Column("overview", sa.Text(), nullable=True),
        sa.Column("first_image", sa.Text(), nullable=True),
        sa.Column("first_image_thumb", sa.Text(), nullable=True),
        sa.Column("source_created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("source_modified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="1", nullable=False),
        sa.Column(
            "synced_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_tour_contents_content_type_id", "tour_contents", ["content_type_id"])
    op.create_index("ix_tour_contents_sigungu_code", "tour_contents", ["sigungu_code"])

    op.create_table(
        "spots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        # 네이티브 ENUM을 쓰지 않는 이유는 app/models/spot.py 주석 참조
        sa.Column(
            "zone",
            sa.Enum(*ZONES, native_enum=False, length=20, name="zone"),
            nullable=False,
        ),
        sa.Column(
            "category",
            sa.Enum(*CATEGORIES, native_enum=False, length=20, name="spotcategory"),
            nullable=False,
        ),
        sa.Column(
            "span",
            sa.Enum(*SPANS, native_enum=False, length=10, name="spotspan"),
            server_default="std",
            nullable=False,
        ),
        sa.Column(
            "rail",
            sa.Enum(*RAILS, native_enum=False, length=10, name="homerail"),
            nullable=True,
        ),
        sa.Column("sticker", sa.String(length=60), nullable=True),
        sa.Column("editorial_desc", sa.Text(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lng", sa.Float(), nullable=True),
        # SET NULL은 안전망. 동기화는 미러 행을 지우지 않고 is_active만 내린다
        sa.Column(
            "tour_content_id",
            sa.String(length=20),
            sa.ForeignKey("tour_contents.content_id", ondelete="SET NULL"),
            nullable=True,
        ),
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
    )
    op.create_index("ix_spots_slug", "spots", ["slug"], unique=True)
    op.create_index("ix_spots_zone", "spots", ["zone"])
    op.create_index("ix_spots_category", "spots", ["category"])
    op.create_index("ix_spots_tour_content_id", "spots", ["tour_content_id"])
    # 홈 레일: WHERE rail = ? ORDER BY display_order
    op.create_index("ix_spots_rail_display_order", "spots", ["rail", "display_order"])


def downgrade() -> None:
    op.drop_table("spots")
    op.drop_table("tour_contents")
