from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Review(Base):
    """방문 후기.

    지금은 시드로만 들어가지만 사용자 생성 데이터이므로 상수가 아니라 테이블로
    만든다 — 나중에 작성 기능이 붙는다. 그때 user_id가 채워진다.
    """

    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )

    author_name: Mapped[str] = mapped_column(String(60))
    country: Mapped[str] = mapped_column(String(40))
    rating: Mapped[int] = mapped_column(Integer)
    body: Mapped[str] = mapped_column(Text)
    # 어느 장소에 대한 후기인지. 아직 spots와 잇지 않는다 — 시드 데이터의
    # 표기가 관광지 이름과 정확히 일치하지 않는다.
    spot_label: Mapped[str] = mapped_column(String(80))
    helpful_count: Mapped[int] = mapped_column(Integer, server_default="0", default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
