from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AiCourse(Base):
    """생성된 코스 한 건.

    디자인의 selectHistory는 기록에서 가짜 대화를 재구성하는데, 그러면 사용자가
    실제로 받았던 일정이 사라진다. 결과를 그대로 저장한다 (ADR 009).

    로그인하지 않은 사용자는 user_id가 NULL이고 브라우저에만 남는다.
    """

    __tablename__ = "ai_courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    title: Mapped[str] = mapped_column(String(120))
    summary: Mapped[str] = mapped_column(Text)
    duration: Mapped[str] = mapped_column(String(20))
    # 요청 원문. 어떤 말에 이 일정이 나왔는지 남는다.
    prompt: Mapped[str] = mapped_column(Text, default="")
    interests: Mapped[list[str]] = mapped_column(JSON, default=list)

    # 일자별 항목. 표시 전용이라 정규화하지 않는다 — 코스를 통째로 읽고 쓴다.
    days: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    generated_by: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
