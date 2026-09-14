"""TourAPI(한국관광공사) 호출 레이어.

Protocol을 먼저 두는 이유는 테스트다. 적재 로직 전체를 네트워크 없이
검증하려면 서비스가 구현체가 아니라 이 계약에 의존해야 한다.
"""

from typing import Protocol

from app.integrations.publicdata import PublicDataClient, PublicDataError
from app.integrations.tourapi.schemas import SigunguCode, TourItem

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
