"""TourAPI 호출 레이어 — 오퍼레이션 이름과 파라미터 매핑.

여기서 검증하는 것은 "우리가 TourAPI에 무엇을 어떻게 묻는가"다.
봉투 파싱은 test_publicdata_client.py가, 적재는 test_tour_sync.py가 맡는다.
"""

import json
from pathlib import Path
from typing import Any

import httpx
import pytest

from app.integrations.publicdata import PublicDataClient, PublicDataError
from app.integrations.tourapi import GANGWON_AREA_CODE, HttpTourApiClient

FIXTURES = Path(__file__).parent / "fixtures" / "tourapi"


def payload(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((FIXTURES / f"{name}.json").read_text())
    return data


def build(fixture: str, sink: dict[str, Any] | None = None) -> HttpTourApiClient:
    def handler(request: httpx.Request) -> httpx.Response:
        if sink is not None:
            sink["path"] = request.url.path
            sink["params"] = dict(request.url.params)
        return httpx.Response(200, json=payload(fixture))

    return HttpTourApiClient(
        PublicDataClient(
            base_url="http://example.test/KorService2",
            service_key="KEY",
            transport=httpx.MockTransport(handler),
        )
    )


async def test_지역목록은_areaBasedList2를_부른다() -> None:
    sink: dict[str, Any] = {}
    client = build("area_based_list", sink)

    items, total = await client.list_area_contents(area_code=GANGWON_AREA_CODE)

    assert sink["path"].endswith("/areaBasedList2")
    assert sink["params"]["areaCode"] == "32"
    assert total == 2
    assert [i.title for i in items] == ["경포대", "오죽헌"]


async def test_선택_파라미터는_준_것만_실린다() -> None:
    sink: dict[str, Any] = {}
    client = build("area_based_list", sink)

    await client.list_area_contents(
        area_code="32", sigungu_code="1", content_type_id="12", page_no=2, num_of_rows=50
    )

    assert sink["params"]["sigunguCode"] == "1"
    assert sink["params"]["contentTypeId"] == "12"
    assert sink["params"]["pageNo"] == "2"
    assert sink["params"]["numOfRows"] == "50"


async def test_선택_파라미터를_안_주면_빠진다() -> None:
    sink: dict[str, Any] = {}
    client = build("area_based_list", sink)

    await client.list_area_contents(area_code="32")

    assert "sigunguCode" not in sink["params"]
    assert "contentTypeId" not in sink["params"]


async def test_시군구코드는_areaCode2로_조회한다() -> None:
    sink: dict[str, Any] = {}
    client = build("area_code", sink)

    codes = await client.list_sigungu_codes(area_code="32")

    assert sink["path"].endswith("/areaCode2")
    assert [c.name for c in codes] == ["강릉시", "고성군", "동해시"]


async def test_이름으로_시군구코드를_찾는다() -> None:
    # 강릉 코드를 상수로 박지 않는 이유가 이것이다 — 지역을 넓힐 때 그대로 쓴다
    client = build("area_code")

    assert await client.resolve_sigungu_code(area_code="32", name="강릉시") == "1"
    assert await client.resolve_sigungu_code(area_code="32", name="동해시") == "3"


async def test_없는_시군구_이름이면_올린다() -> None:
    client = build("area_code")

    with pytest.raises(PublicDataError, match="찾지 못했습니다"):
        await client.resolve_sigungu_code(area_code="32", name="서울시")


async def test_결과가_없으면_빈_목록과_0을_돌려준다() -> None:
    client = build("empty")

    items, total = await client.list_area_contents(area_code="32")

    assert items == []
    assert total == 0


async def test_인증_실패는_PublicDataError로_올라온다() -> None:
    client = build("auth_error")

    with pytest.raises(PublicDataError) as exc:
        await client.list_area_contents(area_code="32")

    assert exc.value.result_code == "3000"
