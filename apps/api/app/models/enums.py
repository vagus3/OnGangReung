from enum import StrEnum


class Zone(StrEnum):
    """강릉 권역. TourAPI의 sigungu는 강릉시 하나로 끝나므로 우리가 나눈 분류다."""

    GYEONGPO = "gyeongpo"
    CITY = "city"
    DAEGWALLYEONG = "daegwallyeong"
    JUMUNJIN = "jumunjin"
    JEONGDONGJIN = "jeongdongjin"


class SpotCategory(StrEnum):
    """필터 칩의 택소노미. TourAPI contentTypeId와 1:1이 아니다."""

    NATURE = "nature"
    CAFE = "cafe"
    HISTORY = "history"
    FOOD = "food"
    DOWNTOWN = "downtown"


class SpotSpan(StrEnum):
    """카드가 그리드에서 차지하는 폭. 편집자가 정하는 레이아웃 지시다."""

    STD = "std"
    WIDE = "wide"
    TALL = "tall"


class HomeRail(StrEnum):
    """홈 화면의 가로 레일 소속. 어디에도 안 실리면 NULL이다."""

    BEACH = "beach"
    FOOD = "food"
    HOT = "hot"
    NIGHT = "night"
