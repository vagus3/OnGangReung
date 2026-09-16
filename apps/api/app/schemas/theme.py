"""테마 코스 DTO."""

from pydantic import BaseModel, ConfigDict

from app.models import Theme, ThemeSpot
from app.schemas.spot import SpotRead


class ThemeRead(BaseModel):
    """목록용. 테마 카드가 그리는 데 필요한 만큼만 담는다."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    name_en: str
    tagline: str
    season: str
    car_note: str


class ThemeEntryRead(BaseModel):
    """테마 안의 장소 한 곳.

    note/hint는 장소의 속성이 아니라 이 테마 맥락에서의 서술이다. 그래서
    SpotRead 안이 아니라 밖에 둔다.
    """

    note: str
    hint: str | None
    spot: SpotRead

    @classmethod
    def from_entry(cls, entry: ThemeSpot) -> "ThemeEntryRead":
        return cls(
            note=entry.note,
            hint=entry.hint,
            spot=SpotRead.from_spot(entry.spot),
        )


class ThemeDetailRead(ThemeRead):
    """상세용. 본문과 장소 목록을 덧붙인다."""

    body: str
    entries: list[ThemeEntryRead]

    @classmethod
    def from_theme(cls, theme: Theme) -> "ThemeDetailRead":
        """호출 전에 entries와 그 spot을 eager load해야 한다 (lazy="raise")."""
        return cls(
            id=theme.id,
            slug=theme.slug,
            name=theme.name,
            name_en=theme.name_en,
            tagline=theme.tagline,
            season=theme.season,
            car_note=theme.car_note,
            body=theme.body,
            entries=[ThemeEntryRead.from_entry(entry) for entry in theme.entries],
        )
