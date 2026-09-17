"""create ai_courses

Revision ID: 0006
Revises: 0005
Create Date: 2026-09-17
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0006"
down_revision: str | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ai_courses",
        sa.Column("id", sa.Integer(), primary_key=True),
        # 로그인하지 않고 만든 코스는 user_id가 비어 있다
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("duration", sa.String(length=20), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False, server_default=""),
        sa.Column("interests", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("days", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("generated_by", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_ai_courses_user_id", "ai_courses", ["user_id"])
    op.create_index("ix_ai_courses_created_at", "ai_courses", ["created_at"])


def downgrade() -> None:
    op.drop_table("ai_courses")
