"""create users and sessions

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-17

세션은 서버에 둔다 — 로그아웃·탈퇴에서 즉시 끊어야 하고, 처리방침이
"회원 탈퇴 시 즉시 파기"를 약속한다 (ADR 008).
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("nickname", sa.String(length=40), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("home_region", sa.String(length=60), nullable=True),
        sa.Column("travel_style", sa.String(length=60), nullable=True),
        # 마케팅만 기본 꺼짐 — 광고성 정보는 명시적 동의가 원칙이다
        sa.Column("noti_weather", sa.Boolean(), server_default="1", nullable=False),
        sa.Column("noti_festival", sa.Boolean(), server_default="1", nullable=False),
        sa.Column("noti_course", sa.Boolean(), server_default="1", nullable=False),
        sa.Column("noti_emergency", sa.Boolean(), server_default="1", nullable=False),
        sa.Column("noti_marketing", sa.Boolean(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        # 토큰 원문이 아니라 해시를 담는다
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_sessions_token_hash", "sessions", ["token_hash"], unique=True)
    op.create_index("ix_sessions_user_id", "sessions", ["user_id"])


def downgrade() -> None:
    op.drop_table("sessions")
    op.drop_table("users")
