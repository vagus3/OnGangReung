"""TourAPI 응답의 외부 계약.

필드명이 전부 소문자에 언더스코어가 없다(contentid, firstimage, mapx).
여기서 우리 이름으로 번역해두면 그 표기가 이 파일 밖으로 새지 않는다.
"""

from datetime import UTC, datetime, timedelta

from pydantic import BaseModel, ConfigDict, Field, field_validator

# TourAPI의 시각은 KST 기준으로 내려온다
KST = timedelta(hours=9)


def _parse_stamp(value: str | None) -> datetime | None:
    """YYYYMMDDHHMMSS 형식을 datetime으로. 형식이 어긋나면 버린다."""
    if not value:
        return None
    try:
        naive = datetime.strptime(value.strip(), "%Y%m%d%H%M%S")
    except ValueError:
        return None
    return (naive - KST).replace(tzinfo=UTC)


class TourItem(BaseModel):
    """areaBasedList2 / detailCommon2가 내려주는 콘텐츠 한 건."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    content_id: str = Field(alias="contentid")
    content_type_id: str | None = Field(default=None, alias="contenttypeid")
    title: str = ""
    addr1: str | None = None
    addr2: str | None = None
    zipcode: str | None = None
    area_code: str | None = Field(default=None, alias="areacode")
    sigungu_code: str | None = Field(default=None, alias="sigungucode")
    cat1: str | None = None
    cat2: str | None = None
    cat3: str | None = None
    # TourAPI는 mapx가 경도, mapy가 위도다. 여기서 바로잡아 담는다.
    lng: float | None = Field(default=None, alias="mapx")
    lat: float | None = Field(default=None, alias="mapy")
    map_level: str | None = Field(default=None, alias="mlevel")
    tel: str | None = None
    homepage: str | None = None
    overview: str | None = None
    first_image: str | None = Field(default=None, alias="firstimage")
    first_image_thumb: str | None = Field(default=None, alias="firstimage2")
    created_at: datetime | None = Field(default=None, alias="createdtime")
    modified_at: datetime | None = Field(default=None, alias="modifiedtime")

    @field_validator("lng", "lat", mode="before")
    @classmethod
    def _blank_coord_to_none(cls, value: object) -> object:
        # 좌표가 없는 콘텐츠는 빈 문자열로 온다
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("created_at", "modified_at", mode="before")
    @classmethod
    def _coerce_stamp(cls, value: object) -> object:
        if isinstance(value, str):
            return _parse_stamp(value)
        return value

    @field_validator(
        "content_type_id",
        "addr1",
        "addr2",
        "zipcode",
        "area_code",
        "sigungu_code",
        "cat1",
        "cat2",
        "cat3",
        "map_level",
        "tel",
        "homepage",
        "overview",
        "first_image",
        "first_image_thumb",
        mode="before",
    )
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value


class SigunguCode(BaseModel):
    """areaCode2가 내려주는 시군구 코드."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    code: str
    name: str
