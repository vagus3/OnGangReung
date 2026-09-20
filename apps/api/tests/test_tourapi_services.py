"""TourAPI 부가 서비스 — 무장애·사진·연관 관광지·집중률.

여기서 검증하는 것은 두 가지다.
1. 어느 경로의 어떤 오퍼레이션을 부르고 파라미터를 어떻게 싣는가
2. 기관이 내려주는 표기를 우리 이름으로 옳게 번역하는가

봉투 파싱은 test_publicdata_client.py가 맡는다.
"""

import json
from pathlib import Path
from typing import Any

import httpx

from app.integrations.publicdata import PublicDataClient
from app.integrations.tourapi import (
    CONCENTRATION,
    KOR_WITH,
    PHOTO_GALLERY,
    RELATED_SPOT,
    HttpBarrierFreeClient,
    HttpConcentrationClient,
    HttpPhotoGalleryClient,
    HttpRelatedSpotClient,
    HttpTourApiClient,
    TourLanguage,
    service_url,
)

FIXTURES = Path(__file__).parent / "fixtures" / "tourapi"
ROOT = "http://example.test/B551011"


def payload(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((FIXTURES / f"{name}.json").read_text())
    return data


def transport(fixture: str, sink: dict[str, Any] | None = None) -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        if sink is not None:
            sink["path"] = request.url.path
            sink["params"] = dict(request.url.params)
        return httpx.Response(200, json=payload(fixture))

    return httpx.MockTransport(handler)


def client_for(service: str, fixture: str, sink: dict[str, Any] | None = None) -> PublicDataClient:
    return PublicDataClient(
        base_url=service_url(ROOT, service),
        service_key="KEY",
        transport=transport(fixture, sink),
    )


def test_서비스_경로는_기관_루트_아래에_붙는다() -> None:
    assert service_url(ROOT, KOR_WITH) == f"{ROOT}/KorWithService2"
    # 루트 끝에 슬래시가 있어도 중복되지 않는다
    assert service_url(ROOT + "/", PHOTO_GALLERY) == f"{ROOT}/PhotoGalleryService1"


def test_다국어는_같은_클라이언트에_경로만_바꿔_쓴다() -> None:
    # 오퍼레이션과 응답이 국문과 같아 언어별로 코드를 복제하지 않는다
    assert TourLanguage.EN.value == "EngService2"
    assert service_url(ROOT, TourLanguage.JA) == f"{ROOT}/JpnService2"


async def test_무장애_상세는_detailWithTour2를_부른다() -> None:
    sink: dict[str, Any] = {}
    client = HttpBarrierFreeClient(client_for(KOR_WITH, "barrier_free_detail", sink))

    info = await client.get_detail(content_id="126508")

    assert sink["path"] == "/B551011/KorWithService2/detailWithTour2"
    assert sink["params"]["contentId"] == "126508"
    assert info is not None
    assert info.wheelchair == "수동 휠체어 2대 무료 대여"
    assert info.exit_ == "주출입구 턱 없음"
    # 빈 문자열은 "없음"이 아니라 "등록되지 않음"이다 — None으로 둔다
    assert info.elevator is None


async def test_무장애_정보가_없으면_None이다() -> None:
    client = HttpBarrierFreeClient(client_for(KOR_WITH, "empty"))

    assert await client.get_detail(content_id="999") is None


async def test_무장애_목록은_국문과_같은_형태로_온다() -> None:
    sink: dict[str, Any] = {}
    client = HttpBarrierFreeClient(client_for(KOR_WITH, "area_based_list", sink))

    items, total = await client.list_area_contents(area_code="32", sigungu_code="1")

    assert sink["path"].endswith("/areaBasedList2")
    assert sink["params"]["sigunguCode"] == "1"
    assert total == 2
    assert [i.title for i in items] == ["경포대", "오죽헌"]


async def test_사진은_키워드로_찾는다() -> None:
    sink: dict[str, Any] = {}
    client = HttpPhotoGalleryClient(client_for(PHOTO_GALLERY, "photo_search", sink))

    photos, total = await client.search(keyword="강릉")

    assert sink["path"] == "/B551011/PhotoGalleryService1/gallerySearchList1"
    assert sink["params"]["keyword"] == "강릉"
    assert total == 2
    assert photos[0].title == "경포호 일출"
    assert photos[0].photographer == "홍길동"
    assert photos[0].taken_at is not None
    assert photos[0].taken_at.year == 2024
    # 촬영월 형식이 어긋나면 버린다 — 출처 표기는 남는다
    assert photos[1].taken_at is None
    assert photos[1].photographer is None


async def test_연관_관광지는_지역_기준으로_묻는다() -> None:
    sink: dict[str, Any] = {}
    client = HttpRelatedSpotClient(client_for(RELATED_SPOT, "related_spots", sink))

    related, total = await client.list_related(
        area_code="32", signgu_code="32030", base_ym="202608"
    )

    assert sink["path"] == "/B551011/TarRlteTarService1/areaBasedList1"
    assert sink["params"]["areaCd"] == "32"
    assert sink["params"]["baseYm"] == "202608"
    assert total == 2
    assert related[0].base_name == "경포해변"
    assert related[0].name == "안목해변"
    assert related[0].rank == 1
    # 순위가 비어 있어도 항목 자체는 버리지 않는다
    assert related[1].rank is None


async def test_집중률은_기준일을_실어_묻는다() -> None:
    sink: dict[str, Any] = {}
    client = HttpConcentrationClient(client_for(CONCENTRATION, "concentration", sink))

    rates, total = await client.list_rates(area_code="32", base_ymd="20260815")

    assert sink["path"] == "/B551011/TatsCnctrRateService/tatsCnctrRatedList"
    assert sink["params"]["baseYmd"] == "20260815"
    assert total == 2
    assert rates[0].name == "경포해변"
    assert rates[0].rate == 87.4
    # 수치가 비어 있으면 0이 아니라 None이다 — 한산함과 미집계는 다르다
    assert rates[1].rate is None


async def test_선택_파라미터는_준_것만_실린다() -> None:
    sink: dict[str, Any] = {}
    client = HttpRelatedSpotClient(client_for(RELATED_SPOT, "related_spots", sink))

    await client.list_related(area_code="32")

    assert "signguCd" not in sink["params"]
    assert "baseYm" not in sink["params"]


async def test_국문_클라이언트는_언어만_바꿔_재사용된다() -> None:
    sink: dict[str, Any] = {}
    client = HttpTourApiClient(client_for(TourLanguage.EN, "area_based_list", sink))

    await client.list_area_contents(area_code="32")

    assert sink["path"] == "/B551011/EngService2/areaBasedList2"
