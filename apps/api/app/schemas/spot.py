"""관광지 DTO.

편집 필드는 spots가, 사실 필드(주소·전화·사진)는 tour_contents가 갖고 있다.
클라이언트는 그 분리를 알 필요가 없으므로 여기서 하나로 합쳐 내려준다.
"""

from pydantic import BaseModel, ConfigDict

from app.models import Spot
from app.models.enums import HomeRail, SpotCategory, SpotSpan, Zone


class SpotRead(BaseModel):
    """목록용. 레일 카드와 권역 목록이 그리는 데 필요한 만큼만 담는다."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    zone: Zone
    category: SpotCategory
    span: SpotSpan
    rail: HomeRail | None
    sticker: str | None
    editorial_desc: str
    tags: list[str]
    lat: float | None
    lng: float | None
    image_url: str | None
    thumbnail_url: str | None

    @classmethod
    def from_spot(cls, spot: Spot) -> "SpotRead":
        """편집 엔티티와 미러를 합친다.

        좌표는 자체 값을 우선한다. TourAPI 좌표가 부정확한 장소를 편집자가
        바로잡을 수 있어야 하기 때문이다.
        호출 전에 tour_content를 eager load해야 한다 (lazy="raise").
        """
        content = spot.tour_content
        return cls(
            id=spot.id,
            slug=spot.slug,
            name=spot.name,
            zone=spot.zone,
            category=spot.category,
            span=spot.span,
            rail=spot.rail,
            sticker=spot.sticker,
            editorial_desc=spot.editorial_desc,
            tags=spot.tags,
            lat=spot.lat if spot.lat is not None else (content.lat if content else None),
            lng=spot.lng if spot.lng is not None else (content.lng if content else None),
            image_url=content.first_image if content else None,
            thumbnail_url=content.first_image_thumb if content else None,
        )


class SpotDetailRead(SpotRead):
    """상세용. TourAPI가 갖고 있는 사실 정보를 덧붙인다."""

    address: str | None
    tel: str | None
    homepage: str | None
    overview: str | None
    tour_content_id: str | None

    @classmethod
    def from_spot(cls, spot: Spot) -> "SpotDetailRead":
        content = spot.tour_content
        base = SpotRead.from_spot(spot)
        address = None
        if content and content.addr1:
            address = " ".join(filter(None, (content.addr1, content.addr2)))
        return cls(
            **base.model_dump(),
            address=address,
            tel=content.tel if content else None,
            homepage=content.homepage if content else None,
            overview=content.overview if content else None,
            tour_content_id=spot.tour_content_id,
        )
