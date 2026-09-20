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


class BarrierFreeInfo(BaseModel):
    """KorWithService2 / detailWithTour2 — 콘텐츠 한 건의 무장애 정보.

    항목마다 "있음/없음"이 아니라 서술 문장이 온다. 그대로 보여주는 것이
    맞다 — 요약하면 현장에서 어긋날 때 책임질 수 없다.
    """

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    content_id: str = Field(alias="contentid")
    # 주차장·출입구·경사로처럼 이동 자체를 막는 것부터 담는다
    parking: str | None = None
    route: str | None = None
    elevator: str | None = None
    restroom: str | None = None
    wheelchair: str | None = None
    exit_: str | None = Field(default=None, alias="exit")
    braille_block: str | None = Field(default=None, alias="brailleblock")
    helpdog: str | None = None
    audio_guide: str | None = Field(default=None, alias="audioguide")
    big_print: str | None = Field(default=None, alias="bigprint")
    sign_guide: str | None = Field(default=None, alias="signguide")
    stroller: str | None = None
    lactation_room: str | None = Field(default=None, alias="lactationroom")

    @field_validator("*", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value


class GalleryPhoto(BaseModel):
    """PhotoGalleryService1 — 포토코리아 사진 한 장.

    공공누리 1유형이라 출처만 밝히면 쓸 수 있다. 출처 표기를 위해
    촬영자(photographer)를 반드시 들고 다닌다.
    """

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    gallery_id: str = Field(alias="galContentId")
    title: str = Field(default="", alias="galTitle")
    url: str | None = Field(default=None, alias="galWebImageUrl")
    photographer: str | None = Field(default=None, alias="galPhotographer")
    keywords: str | None = Field(default=None, alias="galSearchKeyword")
    location: str | None = Field(default=None, alias="galPhotographyLocation")
    taken_at: datetime | None = Field(default=None, alias="galPhotographyMonth")

    @field_validator("taken_at", mode="before")
    @classmethod
    def _coerce_month(cls, value: object) -> object:
        # 촬영월은 YYYYMM으로 온다. 일자가 없으므로 1일로 맞춘다.
        if isinstance(value, str) and value.strip():
            try:
                return datetime.strptime(value.strip(), "%Y%m").replace(tzinfo=UTC)
            except ValueError:
                return None
        return value

    @field_validator("url", "photographer", "keywords", "location", mode="before")
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value


class RelatedSpot(BaseModel):
    """TarRlteTarService1 — 어떤 관광지와 함께 찾는 관광지.

    "이 곳을 본 사람이 같이 간 곳"이다. AI 코스의 다음 목적지 후보와
    장소 상세의 '이어서 보기'에 쓸 수 있다.
    """

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    base_name: str | None = Field(default=None, alias="tAtsNm")
    name: str = Field(alias="rlteTatsNm")
    rank: int | None = Field(default=None, alias="rlteRank")
    category_large: str | None = Field(default=None, alias="rlteCtgryLclsNm")
    category_medium: str | None = Field(default=None, alias="rlteCtgryMclsNm")
    category_small: str | None = Field(default=None, alias="rlteCtgrySclsNm")
    region_name: str | None = Field(default=None, alias="rlteRegnNm")
    signgu_name: str | None = Field(default=None, alias="rlteSignguNm")

    @field_validator("rank", mode="before")
    @classmethod
    def _coerce_rank(cls, value: object) -> object:
        if isinstance(value, str):
            stripped = value.strip()
            return int(stripped) if stripped.isdigit() else None
        return value


class ConcentrationRate(BaseModel):
    """TatsCnctrRateService — 관광지 집중률(혼잡도) 한 건.

    값이 클수록 같은 시기에 사람이 몰린다. 디자인의 '지금은 성수기입니다'
    같은 안내를 추정이 아니라 수치로 말할 수 있게 해준다.
    """

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    name: str = Field(alias="tAtsNm")
    area_code: str | None = Field(default=None, alias="areaCd")
    area_name: str | None = Field(default=None, alias="areaNm")
    signgu_code: str | None = Field(default=None, alias="signguCd")
    signgu_name: str | None = Field(default=None, alias="signguNm")
    # 기준 일자(YYYYMMDD)와 집중률
    base_date: str | None = Field(default=None, alias="baseYmd")
    rate: float | None = Field(default=None, alias="cnctrRate")

    @field_validator("rate", mode="before")
    @classmethod
    def _coerce_rate(cls, value: object) -> object:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return None
            try:
                return float(stripped)
            except ValueError:
                return None
        return value
