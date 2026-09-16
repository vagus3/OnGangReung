from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.spot import Spot


class Theme(Base):
    """하나의 주제로 하루를 묶은 코스.

    관광지를 거느리는 큐레이션 컬렉션이며 전부 편집 저작물이다. 공공 API에
    대응물이 없다 (docs/api/public-data-apis.md 3절).
    """

    __tablename__ = "themes"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(60))
    name_en: Mapped[str] = mapped_column(String(60))
    tagline: Mapped[str] = mapped_column(String(200))
    season: Mapped[str] = mapped_column(String(40))
    car_note: Mapped[str] = mapped_column(String(40))
    body: Mapped[str] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, server_default="0", default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    entries: Mapped[list["ThemeSpot"]] = relationship(
        back_populates="theme",
        order_by="ThemeSpot.display_order",
        lazy="raise",
        cascade="all, delete-orphan",
    )


class ThemeSpot(Base):
    """테마와 관광지의 연결.

    연결 테이블을 쓰는 이유는 순서 때문만이 아니다. 같은 장소가 테마마다 다른
    문장으로 소개된다 — "기차에서 먹을 것을 미리 삽니다"는 빵지순례 맥락의
    서술이고 장소 자체의 속성이 아니다. 그 문장이 놓일 자리가 여기다.
    """

    __tablename__ = "theme_spots"
    __table_args__ = (UniqueConstraint("theme_id", "spot_id", name="uq_theme_spots"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    theme_id: Mapped[int] = mapped_column(ForeignKey("themes.id", ondelete="CASCADE"), index=True)
    spot_id: Mapped[int] = mapped_column(ForeignKey("spots.id", ondelete="CASCADE"), index=True)

    # 이 테마 맥락에서의 한 줄 소개와 짧은 힌트
    note: Mapped[str] = mapped_column(String(200))
    hint: Mapped[str | None] = mapped_column(String(60))
    display_order: Mapped[int] = mapped_column(Integer, server_default="0", default=0)

    theme: Mapped[Theme] = relationship(back_populates="entries", lazy="raise")
    spot: Mapped[Spot] = relationship(lazy="raise")
