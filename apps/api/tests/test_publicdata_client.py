"""공공데이터 공통 클라이언트의 봉투 파싱.

HTTP는 httpx MockTransport로 막고, 봉투 해석 자체를 검증한다.
실제 응답의 까다로운 부분(빈 items, HTTP 200인 오류)을 픽스처로 재현한다.
"""

import json
from pathlib import Path
from typing import Any

import httpx
import pytest

from app.integrations.publicdata import PublicDataClient, PublicDataError
from app.integrations.publicdata.client import _parse_envelope

FIXTURES = Path(__file__).parent / "fixtures" / "tourapi"


def load(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((FIXTURES / f"{name}.json").read_text())
    return data


def test_정상_응답에서_아이템과_전체건수를_꺼낸다() -> None:
    page = _parse_envelope(load("area_based_list"), 1, 100)

    assert len(page.items) == 2
    assert page.total_count == 2
    assert page.items[0]["contentid"] == "126508"


def test_결과가_없으면_items가_빈_문자열로_온다() -> None:
    # data.go.kr은 결과가 없을 때 items를 리스트가 아니라 빈 문자열로 내려준다
    page = _parse_envelope(load("empty"), 1, 100)

    assert page.items == []
    assert page.total_count == 0


def test_resultCode가_0000이_아니면_올린다() -> None:
    with pytest.raises(PublicDataError) as exc:
        _parse_envelope(load("auth_error"), 1, 100)

    assert exc.value.result_code == "3000"
    assert "SERVICE KEY" in str(exc.value)


def test_아이템이_하나면_리스트로_감싸지_않고_올_수_있다() -> None:
    payload = {
        "response": {
            "header": {"resultCode": "0000"},
            "body": {"items": {"item": {"contentid": "1"}}, "totalCount": 1},
        }
    }

    page = _parse_envelope(payload, 1, 100)

    assert len(page.items) == 1


def test_response가_없으면_올린다() -> None:
    # 인증 실패 시 포털이 봉투 없이 다른 형식을 내려보낸다
    with pytest.raises(PublicDataError, match="response가 없습니다"):
        _parse_envelope({"OpenAPI_ServiceResponse": {}}, 1, 100)


def test_body가_없으면_올린다() -> None:
    with pytest.raises(PublicDataError, match="body가 없습니다"):
        _parse_envelope({"response": {"header": {"resultCode": "0000"}}}, 1, 100)


def test_dict가_아니면_올린다() -> None:
    with pytest.raises(PublicDataError, match="예상치 못한 응답 형식"):
        _parse_envelope("<xml/>", 1, 100)


def test_has_next는_전체건수와_페이지로_판단한다() -> None:
    first = _parse_envelope(
        {
            "response": {
                "header": {"resultCode": "0000"},
                "body": {"items": {"item": []}, "totalCount": 250, "pageNo": 1, "numOfRows": 100},
            }
        },
        1,
        100,
    )
    last = _parse_envelope(
        {
            "response": {
                "header": {"resultCode": "0000"},
                "body": {"items": {"item": []}, "totalCount": 250, "pageNo": 3, "numOfRows": 100},
            }
        },
        3,
        100,
    )

    assert first.has_next is True
    assert last.has_next is False


async def test_필수_파라미터가_쿼리에_실린다() -> None:
    seen: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen.update(dict(request.url.params))
        return httpx.Response(200, json=load("area_based_list"))

    client = PublicDataClient(
        base_url="http://example.test/KorService2",
        service_key="KEY",
        mobile_app="testapp",
        transport=httpx.MockTransport(handler),
    )

    page = await client.fetch_page("areaBasedList2", params={"areaCode": "32"})

    assert seen["serviceKey"] == "KEY"
    assert seen["_type"] == "json"
    assert seen["MobileApp"] == "testapp"
    assert seen["areaCode"] == "32"
    assert len(page.items) == 2


async def test_HTTP_오류는_PublicDataError로_바뀐다() -> None:
    client = PublicDataClient(
        base_url="http://example.test/KorService2",
        service_key="KEY",
        transport=httpx.MockTransport(lambda _: httpx.Response(500)),
    )

    with pytest.raises(PublicDataError, match="호출 실패"):
        await client.fetch_page("areaBasedList2")


async def test_JSON이_아닌_응답은_읽을_수_없다고_올린다() -> None:
    # 인증키가 잘못되면 포털이 XML 오류 페이지를 200으로 내려보낸다
    client = PublicDataClient(
        base_url="http://example.test/KorService2",
        service_key="BAD",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(200, text="<OpenAPI_ServiceResponse/>")
        ),
    )

    with pytest.raises(PublicDataError, match="JSON으로 읽을 수 없습니다"):
        await client.fetch_page("areaBasedList2")


async def test_빈_파라미터는_쿼리에서_빠진다() -> None:
    seen: dict[str, str] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen.update(dict(request.url.params))
        return httpx.Response(200, json=load("empty"))

    client = PublicDataClient(
        base_url="http://example.test/KorService2",
        service_key="KEY",
        transport=httpx.MockTransport(handler),
    )

    await client.fetch_page("areaBasedList2", params={"areaCode": "32", "sigunguCode": ""})

    assert "sigunguCode" not in seen
