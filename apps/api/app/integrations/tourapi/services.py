"""TourAPI 서비스 경로.

한국관광공사는 기관 코드 B551011 아래에 서비스를 여러 개 둔다. 인증·페이징·
봉투 규약은 모두 같으므로(publicdata 레이어가 처리한다) 서비스마다 달라지는
것은 경로와 오퍼레이션 이름뿐이다. 그 둘을 여기 모은다.

> CAUTION: 오퍼레이션 이름은 공공데이터포털 문서 기준이다. 실제 키로 호출해
> 확인한 것은 KorService2뿐이다. 나머지는 키를 받은 뒤 한 번 확인해야 한다.
"""

from enum import StrEnum

# 국문 — 이미 연결돼 있다
KOR = "KorService2"

# 무장애 여행 정보
KOR_WITH = "KorWithService2"

# 관광 사진 정보 (포토코리아). 신규 접미사 2가 아직 없어 1을 쓴다.
PHOTO_GALLERY = "PhotoGalleryService1"

# 관광지별 연관 관광지 정보 (데이터랩)
RELATED_SPOT = "TarRlteTarService1"

# 관광지 집중률 · 방문자 추이 예측
CONCENTRATION = "TatsCnctrRateService"


class TourLanguage(StrEnum):
    """다국어 관광정보 서비스.

    오퍼레이션 이름과 응답 스키마가 국문과 같아서 클라이언트를 그대로 쓰고
    경로만 바꾼다 — 언어별로 코드를 복제하지 않는다.
    """

    KO = KOR
    EN = "EngService2"
    JA = "JpnService2"
    ZH_CN = "ChsService2"
    ZH_TW = "ChtService2"


def service_url(root_url: str, service: str) -> str:
    """기관 루트와 서비스 경로를 붙인다."""
    return f"{root_url.rstrip('/')}/{service}"
