from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TourContent(Base):
    """한국관광공사 TourAPI 콘텐츠의 미러.

    동기화 잡만 이 테이블에 쓴다. 편집 데이터는 spots가 따로 소유하며,
    그래서 동기화가 편집 내용을 덮어쓰는 일이 구조적으로 일어나지 않는다.
    근거: docs/adr/007-public-data-integration-layer.md
    """

    __tablename__ = "tour_contents"

    # TourAPI contentid를 그대로 PK로 쓴다. 외부 식별자가 곧 우리 키다.
    content_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    content_type_id: Mapped[str | None] = mapped_column(String(10), index=True)

    title: Mapped[str] = mapped_column(String(300))
    addr1: Mapped[str | None] = mapped_column(String(300))
    addr2: Mapped[str | None] = mapped_column(String(200))
    zipcode: Mapped[str | None] = mapped_column(String(10))

    area_code: Mapped[str | None] = mapped_column(String(10))
    sigungu_code: Mapped[str | None] = mapped_column(String(10), index=True)
    cat1: Mapped[str | None] = mapped_column(String(10))
    cat2: Mapped[str | None] = mapped_column(String(10))
    cat3: Mapped[str | None] = mapped_column(String(10))

    # TourAPI는 mapx가 경도, mapy가 위도다. 이름을 뒤집어 저장해 혼동을 없앤다.
    lng: Mapped[float | None] = mapped_column(Float)
    lat: Mapped[float | None] = mapped_column(Float)
    map_level: Mapped[str | None] = mapped_column(String(5))

    tel: Mapped[str | None] = mapped_column(String(100))
    homepage: Mapped[str | None] = mapped_column(Text)
    overview: Mapped[str | None] = mapped_column(Text)
    first_image: Mapped[str | None] = mapped_column(Text)
    first_image_thumb: Mapped[str | None] = mapped_column(Text)

    source_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_modified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # TourAPI에서 사라져도 행을 지우지 않는다. spots가 참조하고 있을 수 있다.
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="1", default=True)
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
