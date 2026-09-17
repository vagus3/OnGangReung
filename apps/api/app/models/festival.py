from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import Zone


class Festival(Base):
    """축제.

    홈 축제 섹션과 안내 탭 06 축제가 같은 데이터를 쓴다. 지금은 편집 데이터지만
    TourAPI searchFestival2가 장래 출처이므로 테이블로 만든다 — 권역 설명처럼
    외부 출처가 영영 없는 것과 다르다 (docs/api/public-data-apis.md).
    """

    __tablename__ = "festivals"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    tagline: Mapped[str] = mapped_column(String(200))

    # 디자인은 기간을 '8월 말 · 진행 중', '음력 5월 · 6월경'처럼 사람이 읽는
    # 문구로 쓴다. 음력 기준 축제가 있어 날짜로 정규화하면 오히려 정보가 준다.
    when_label: Mapped[str] = mapped_column(String(80))
    # NOW / D-37 / 예매 / 연례
    badge: Mapped[str | None] = mapped_column(String(20))
    is_now: Mapped[bool] = mapped_column(Boolean, server_default="0", default=False)

    zone: Mapped[Zone] = mapped_column(
        Enum(
            Zone,
            values_callable=lambda members: [m.value for m in members],
            native_enum=False,
            length=20,
        ),
        index=True,
    )
    # 권역 enum과 별개로 디자인이 쓰는 표시 문구 ('시내 · 안목권' 등)
    zone_label: Mapped[str | None] = mapped_column(String(40))
    place: Mapped[str] = mapped_column(String(200))

    about: Mapped[str] = mapped_column(Text)
    hours: Mapped[str | None] = mapped_column(String(200))
    price: Mapped[str | None] = mapped_column(String(120))
    tip: Mapped[str | None] = mapped_column(Text)

    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    display_order: Mapped[int] = mapped_column(Integer, server_default="0", default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
