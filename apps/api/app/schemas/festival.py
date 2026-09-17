"""축제 DTO."""

from pydantic import BaseModel, ConfigDict

from app.models.enums import Zone


class FestivalRead(BaseModel):
    """목록용. 홈 축제 섹션과 안내 06이 쓴다."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    tagline: str
    when_label: str
    badge: str | None
    is_now: bool
    zone: Zone
    zone_label: str | None
    place: str


class FestivalDetailRead(FestivalRead):
    about: str
    hours: str | None
    price: str | None
    tip: str | None
    lat: float | None
    lng: float | None
