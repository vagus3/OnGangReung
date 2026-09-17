from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import HomeRail, SpotCategory, SpotSpan, Zone
from app.models.tour_content import TourContent


class Spot(Base):
    """우리가 큐레이션한 관광지.

    TourAPI에 대응 콘텐츠가 있으면 tour_content_id로 잇고, 없으면 NULL로 둔다
    (안반데기·월화거리처럼 외부에 독립 콘텐츠가 없는 장소가 실제로 있다).
    소개 문구·스티커·권역·태그는 전부 여기 있는 편집 저작물이며 동기화 대상이
    아니다.
    """

    __tablename__ = "spots"
    __table_args__ = (
        # 홈 레일 질의: WHERE rail = ? ORDER BY display_order
        Index("ix_spots_rail_display_order", "rail", "display_order"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))

    # 네이티브 ENUM 대신 VARCHAR를 쓴다. 테스트가 인메모리 SQLite로
    # 돌아 네이티브 ENUM이 없고, Alembic autogenerate가 ENUM 값 추가를
    # 제대로 잡지 못한다. Python 쪽 타입 안전성은 StrEnum이 유지한다.
    zone: Mapped[Zone] = mapped_column(
        Enum(
            Zone,
            values_callable=lambda members: [m.value for m in members],
            native_enum=False,
            length=20,
        ),
        index=True,
    )
    category: Mapped[SpotCategory] = mapped_column(
        Enum(
            SpotCategory,
            values_callable=lambda members: [m.value for m in members],
            native_enum=False,
            length=20,
        ),
        index=True,
    )
    span: Mapped[SpotSpan] = mapped_column(
        Enum(
            SpotSpan,
            values_callable=lambda members: [m.value for m in members],
            native_enum=False,
            length=10,
        ),
        server_default=SpotSpan.STD.value,
        default=SpotSpan.STD,
    )
    rail: Mapped[HomeRail | None] = mapped_column(
        Enum(
            HomeRail,
            values_callable=lambda members: [m.value for m in members],
            native_enum=False,
            length=10,
        )
    )

    sticker: Mapped[str | None] = mapped_column(String(60))
    editorial_desc: Mapped[str] = mapped_column(Text)
    # 표시 전용이라 태그로 거르는 화면이 없다. 필터가 필요해지면 연결 테이블로 뺀다.
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    display_order: Mapped[int] = mapped_column(Integer, server_default="0", default=0)

    # 상세 화면용 편집 필드. TourAPI detailIntro2가 일부를 주지만 미러가 연결되지
    # 않은 장소도 있고 문체가 달라, 편집자가 쓰는 쪽을 우선한다.
    about: Mapped[str | None] = mapped_column(Text)
    hours: Mapped[str | None] = mapped_column(String(200))
    tip: Mapped[str | None] = mapped_column(Text)
    parking: Mapped[str | None] = mapped_column(String(200))
    # [{"name": "...", "price": "..."}] — 표시 전용이라 정규화하지 않는다
    menu: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)

    # TourAPI에 대응 콘텐츠가 없는 장소를 위한 자체 좌표
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)

    # SET NULL은 안전망이다. 동기화는 tour_contents 행을 지우지 않고
    # is_active=False로만 내리므로 정상 경로에서 발동하지 않는다.
    tour_content_id: Mapped[str | None] = mapped_column(
        ForeignKey("tour_contents.content_id", ondelete="SET NULL"), index=True
    )

    # lazy="raise"로 암묵적 지연 로딩을 막는다. 레일 조회처럼 N건을 한 번에
    # 읽는 화면에서 N+1이 조용히 생기는 것을 런타임 오류로 드러낸다.
    tour_content: Mapped[TourContent | None] = relationship(lazy="raise")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
