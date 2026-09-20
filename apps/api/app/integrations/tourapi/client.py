"""TourAPI(한국관광공사) 호출 레이어.

Protocol을 먼저 두는 이유는 테스트다. 적재 로직 전체를 네트워크 없이
검증하려면 서비스가 구현체가 아니라 이 계약에 의존해야 한다.
"""

from typing import Protocol

from app.integrations.publicdata import PublicDataClient, PublicDataError
from app.integrations.tourapi.schemas import (
    BarrierFreeInfo,
    ConcentrationRate,
    GalleryPhoto,
    RelatedSpot,
    SigunguCode,
    TourItem,
)

# 강원특별자치도
GANGWON_AREA_CODE = "32"


class TourApiClient(Protocol):
    """서비스가 의존하는 계약. 실제 구현은 HttpTourApiClient."""

    async def list_area_contents(
        self,
        *,
        area_code: str,
        sigungu_code: str | None = None,
        content_type_id: str | None = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> tuple[list[TourItem], int]:
        """지역 기반 콘텐츠 한 페이지와 전체 건수를 돌려준다."""
        ...

    async def list_sigungu_codes(self, *, area_code: str) -> list[SigunguCode]: ...


class HttpTourApiClient:
    """실제 HTTP 구현."""

    def __init__(self, client: PublicDataClient) -> None:
        self._client = client

    async def list_area_contents(
        self,
        *,
        area_code: str,
        sigungu_code: str | None = None,
        content_type_id: str | None = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> tuple[list[TourItem], int]:
        params = {"areaCode": area_code}
        if sigungu_code:
            params["sigunguCode"] = sigungu_code
        if content_type_id:
            params["contentTypeId"] = content_type_id

        page = await self._client.fetch_page(
            "areaBasedList2",
            page_no=page_no,
            num_of_rows=num_of_rows,
            params=params,
        )
        return [TourItem.model_validate(item) for item in page.items], page.total_count

    async def list_sigungu_codes(self, *, area_code: str) -> list[SigunguCode]:
        """시군구 코드를 조회한다.

        강릉 코드를 상수로 박지 않는 이유는 지역 확장(속초·동해) 때문이다.
        코드 체계가 바뀌어도 여기서 다시 읽으면 된다.
        """
        page = await self._client.fetch_page(
            "areaCode2", page_no=1, num_of_rows=100, params={"areaCode": area_code}
        )
        return [SigunguCode.model_validate(item) for item in page.items]

    async def resolve_sigungu_code(self, *, area_code: str, name: str) -> str:
        """시군구 이름으로 코드를 찾는다. 못 찾으면 올린다."""
        for entry in await self.list_sigungu_codes(area_code=area_code):
            if entry.name == name:
                return entry.code
        raise PublicDataError(f"{area_code} 지역에서 '{name}' 시군구 코드를 찾지 못했습니다")


# ── 무장애 여행 정보 (KorWithService2) ────────────────────────────────────
# 오퍼레이션은 국문 서비스와 이름이 같고, 상세만 detailWithTour2로 갈린다.
_WITH_DETAIL = "detailWithTour2"


class HttpBarrierFreeClient:
    """무장애 여행 정보. 안내 탭의 접근성 섹션이 쓴다."""

    def __init__(self, client: PublicDataClient) -> None:
        self._client = client

    async def list_area_contents(
        self,
        *,
        area_code: str,
        sigungu_code: str | None = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> tuple[list[TourItem], int]:
        """무장애 정보가 있는 콘텐츠 목록. 응답 형태는 국문과 같다."""
        params = {"areaCode": area_code}
        if sigungu_code:
            params["sigunguCode"] = sigungu_code

        page = await self._client.fetch_page(
            "areaBasedList2", page_no=page_no, num_of_rows=num_of_rows, params=params
        )
        return [TourItem.model_validate(item) for item in page.items], page.total_count

    async def get_detail(self, *, content_id: str) -> BarrierFreeInfo | None:
        """콘텐츠 한 건의 무장애 항목. 등록되지 않았으면 None."""
        page = await self._client.fetch_page(
            _WITH_DETAIL, page_no=1, num_of_rows=1, params={"contentId": content_id}
        )
        if not page.items:
            return None
        return BarrierFreeInfo.model_validate(page.items[0])


# ── 관광 사진 (PhotoGalleryService1) ──────────────────────────────────────
class HttpPhotoGalleryClient:
    """포토코리아 사진. 카드의 '사진 준비 중'을 채우는 곳이다.

    공공누리 1유형이라 출처(촬영자)를 함께 보관한다.
    """

    def __init__(self, client: PublicDataClient) -> None:
        self._client = client

    async def search(
        self, *, keyword: str, page_no: int = 1, num_of_rows: int = 30
    ) -> tuple[list[GalleryPhoto], int]:
        """키워드로 찾는다. 장소명을 그대로 넣는 쓰임을 전제한다."""
        page = await self._client.fetch_page(
            "gallerySearchList1",
            page_no=page_no,
            num_of_rows=num_of_rows,
            params={"keyword": keyword},
        )
        return [GalleryPhoto.model_validate(i) for i in page.items], page.total_count


# ── 연관 관광지 (TarRlteTarService1) ──────────────────────────────────────
class HttpRelatedSpotClient:
    """함께 찾는 관광지. AI 코스의 다음 목적지 후보로 쓸 수 있다."""

    def __init__(self, client: PublicDataClient) -> None:
        self._client = client

    async def list_related(
        self,
        *,
        area_code: str,
        signgu_code: str | None = None,
        base_ym: str | None = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> tuple[list[RelatedSpot], int]:
        """지역 기준 연관 관광지. base_ym은 YYYYMM 기준월이다."""
        params = {"areaCd": area_code}
        if signgu_code:
            params["signguCd"] = signgu_code
        if base_ym:
            params["baseYm"] = base_ym

        page = await self._client.fetch_page(
            "areaBasedList1", page_no=page_no, num_of_rows=num_of_rows, params=params
        )
        return [RelatedSpot.model_validate(i) for i in page.items], page.total_count


# ── 관광지 집중률 (TatsCnctrRateService) ──────────────────────────────────
class HttpConcentrationClient:
    """관광지 집중률. '지금은 성수기입니다'를 추정이 아니라 수치로 말하게 한다."""

    def __init__(self, client: PublicDataClient) -> None:
        self._client = client

    async def list_rates(
        self,
        *,
        area_code: str,
        signgu_code: str | None = None,
        base_ymd: str | None = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> tuple[list[ConcentrationRate], int]:
        """지역 기준 집중률. base_ymd는 YYYYMMDD 기준일이다."""
        params = {"areaCd": area_code}
        if signgu_code:
            params["signguCd"] = signgu_code
        if base_ymd:
            params["baseYmd"] = base_ymd

        page = await self._client.fetch_page(
            "tatsCnctrRatedList",
            page_no=page_no,
            num_of_rows=num_of_rows,
            params=params,
        )
        return [ConcentrationRate.model_validate(i) for i in page.items], page.total_count
