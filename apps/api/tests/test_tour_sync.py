"""TourAPI 적재 로직.

클라이언트를 Protocol로 갈아끼워 네트워크 없이 적재 전체를 검증한다.
픽스처는 실제 TourAPI 응답 형태 그대로다 (tests/fixtures/tourapi/).
"""

import json
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.integrations.tourapi import SigunguCode, TourItem
from app.models import Base, Spot, TourContent
from app.models.enums import SpotCategory, Zone
from app.services.tour_sync import deactivate_missing, sync_area, upsert_contents

FIXTURES = Path(__file__).parent / "fixtures" / "tourapi"


def fixture_items(name: str = "area_based_list") -> list[TourItem]:
    payload: dict[str, Any] = json.loads((FIXTURES / f"{name}.json").read_text())
    raw = payload["response"]["body"]["items"]
    if not isinstance(raw, dict):
        return []
    return [TourItem.model_validate(entry) for entry in raw["item"]]


class FakeTourApiClient:
    """TourApiClient Protocol의 테스트 구현.

    페이지를 미리 담아두고 순서대로 돌려준다. 호출 횟수를 기록해
    페이지 순회가 제때 멈추는지 확인한다.
    """

    def __init__(self, pages: list[list[TourItem]], total: int | None = None) -> None:
        self._pages = pages
        self._total = total if total is not None else sum(len(p) for p in pages)
        self.calls = 0

    async def list_area_contents(
        self,
        *,
        area_code: str,
        sigungu_code: str | None = None,
        content_type_id: str | None = None,
        page_no: int = 1,
        num_of_rows: int = 100,
    ) -> tuple[list[TourItem], int]:
        self.calls += 1
        index = page_no - 1
        if index >= len(self._pages):
            return ([], self._total)
        return (self._pages[index], self._total)

    async def list_sigungu_codes(self, *, area_code: str) -> list[SigunguCode]:
        return [SigunguCode(code="1", name="강릉시")]


@pytest.fixture
async def session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine("sqlite+aiosqlite://")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as s:
        yield s
    await engine.dispose()


async def test_필드가_모델로_옮겨진다(session: AsyncSession) -> None:
    items = fixture_items()

    await upsert_contents(session, items)
    await session.commit()

    content = await session.get(TourContent, "126508")
    assert content is not None
    assert content.title == "경포대"
    assert content.addr1 == "강원특별자치도 강릉시 경포로 365"
    assert content.tel == "033-640-4471"
    assert content.is_active is True


async def test_mapx가_경도_mapy가_위도로_들어간다(session: AsyncSession) -> None:
    # TourAPI는 x/y로 주지만 우리는 lng/lat으로 담는다. 뒤집히면 지도가 깨진다.
    await upsert_contents(session, fixture_items())
    await session.commit()

    content = await session.get(TourContent, "126508")
    assert content is not None
    assert content.lng == pytest.approx(128.8963, abs=1e-3)  # 경도
    assert content.lat == pytest.approx(37.8055, abs=1e-3)  # 위도


async def test_빈_문자열은_None으로_들어간다(session: AsyncSession) -> None:
    # 오죽헌 픽스처는 addr2/tel/firstimage가 빈 문자열이다
    await upsert_contents(session, fixture_items())
    await session.commit()

    content = await session.get(TourContent, "126509")
    assert content is not None
    assert content.addr2 is None
    assert content.tel is None
    assert content.first_image is None


async def test_수정시각이_KST에서_UTC로_변환된다(session: AsyncSession) -> None:
    items = fixture_items()
    gyeongpo = next(i for i in items if i.content_id == "126508")

    # 20250310143000 KST == 2025-03-10 05:30 UTC
    assert gyeongpo.modified_at == datetime(2025, 3, 10, 5, 30, tzinfo=UTC)


async def test_재실행하면_갱신이_아니라_건너뛴다(session: AsyncSession) -> None:
    items = fixture_items()
    await upsert_contents(session, items)
    await session.commit()

    created, updated, skipped = await upsert_contents(session, items)
    await session.commit()

    assert (created, updated) == (0, 0)
    assert skipped == 2


async def test_외부가_더_새로우면_갱신한다(session: AsyncSession) -> None:
    items = fixture_items()
    await upsert_contents(session, items)
    await session.commit()

    newer = items[0].model_copy(
        update={
            "title": "경포대 (개편)",
            "modified_at": datetime(2026, 1, 1, tzinfo=UTC),
        }
    )
    created, updated, skipped = await upsert_contents(session, [newer])
    await session.commit()

    assert (created, updated, skipped) == (0, 1, 0)
    content = await session.get(TourContent, "126508")
    assert content is not None
    assert content.title == "경포대 (개편)"


async def test_외부가_더_오래됐으면_덮지_않는다(session: AsyncSession) -> None:
    items = fixture_items()
    await upsert_contents(session, items)
    await session.commit()

    older = items[0].model_copy(
        update={"title": "옛 이름", "modified_at": datetime(2020, 1, 1, tzinfo=UTC)}
    )
    await upsert_contents(session, [older])
    await session.commit()

    content = await session.get(TourContent, "126508")
    assert content is not None
    assert content.title == "경포대"


async def test_빈_목록은_아무것도_하지_않는다(session: AsyncSession) -> None:
    assert await upsert_contents(session, []) == (0, 0, 0)


async def test_동기화는_페이지를_순회하고_전체건수에서_멈춘다(
    session: AsyncSession,
) -> None:
    items = fixture_items()
    client = FakeTourApiClient(pages=[[items[0]], [items[1]]], total=2)

    result = await sync_area(session, client, area_code="32", num_of_rows=1, max_pages=10)

    assert result.fetched == 2
    assert result.created == 2
    # 2페이지에서 전체건수에 도달하므로 3페이지를 부르지 않는다
    assert client.calls == 2


async def test_max_pages를_넘지_않는다(session: AsyncSession) -> None:
    # 개발계정 트래픽이 1,000건/일이라 상한이 실제로 지켜져야 한다
    items = fixture_items()
    client = FakeTourApiClient(pages=[[items[0]]] * 10, total=999)

    await sync_area(session, client, area_code="32", num_of_rows=1, max_pages=3)

    assert client.calls == 3


async def test_결과가_없으면_즉시_멈춘다(session: AsyncSession) -> None:
    client = FakeTourApiClient(pages=[], total=0)

    result = await sync_area(session, client, area_code="32")

    assert result.fetched == 0
    assert client.calls == 1


async def test_사라진_콘텐츠는_삭제가_아니라_비활성된다(
    session: AsyncSession,
) -> None:
    await upsert_contents(session, fixture_items())
    await session.commit()

    count = await deactivate_missing(session, seen_ids={"126508"}, area_code="32")
    await session.commit()

    assert count == 1
    gone = await session.get(TourContent, "126509")
    assert gone is not None  # 행은 남아 있다
    assert gone.is_active is False


async def test_비활성_처리해도_참조하는_spot이_끊기지_않는다(
    session: AsyncSession,
) -> None:
    """이게 2테이블로 나눈 이유의 핵심이다.

    외부에서 콘텐츠가 사라져도 우리 편집 데이터는 그대로 남아야 한다.
    """
    await upsert_contents(session, fixture_items())
    session.add(
        Spot(
            slug="spot_ojukheon",
            name="오죽헌",
            zone=Zone.GYEONGPO,
            category=SpotCategory.HISTORY,
            editorial_desc="검은 대나무가 둘러싼 조선 중기 상류 주택의 원형.",
            tags=["문화재", "정원"],
            tour_content_id="126509",
        )
    )
    await session.commit()

    await deactivate_missing(session, seen_ids={"126508"}, area_code="32")
    await session.commit()

    spot = (await session.execute(select(Spot).where(Spot.slug == "spot_ojukheon"))).scalar_one()
    assert spot.editorial_desc.startswith("검은 대나무")
    assert spot.tour_content_id == "126509"


async def test_동기화가_spots를_건드리지_않는다(session: AsyncSession) -> None:
    session.add(
        Spot(
            slug="spot_anbandegi",
            name="안반데기",
            zone=Zone.DAEGWALLYEONG,
            category=SpotCategory.NATURE,
            editorial_desc="해발 1100m 배추밭 위로 은하수가 지나간다.",
            tags=["별"],
            tour_content_id=None,  # TourAPI에 대응 콘텐츠가 없는 장소
        )
    )
    await session.commit()

    client = FakeTourApiClient(pages=[fixture_items()], total=2)
    await sync_area(session, client, area_code="32", deactivate=True)

    spot = (await session.execute(select(Spot).where(Spot.slug == "spot_anbandegi"))).scalar_one()
    assert spot.editorial_desc.startswith("해발 1100m")
    assert spot.tour_content_id is None


async def test_좌표가_없는_콘텐츠도_받는다() -> None:
    item = TourItem.model_validate({"contentid": "1", "title": "좌표 없음", "mapx": "", "mapy": ""})

    assert item.lng is None
    assert item.lat is None


async def test_형식이_어긋난_시각은_버린다() -> None:
    item = TourItem.model_validate({"contentid": "1", "title": "x", "modifiedtime": "not-a-date"})

    assert item.modified_at is None


async def test_partial_sync_does_not_deactivate_unfetched_rows(session: AsyncSession) -> None:
    items = fixture_items()
    await upsert_contents(session, items)
    await session.commit()
    result = await sync_area(
        session,
        FakeTourApiClient([[items[0]]], total=2),
        area_code="32",
        num_of_rows=1,
        max_pages=1,
        deactivate=True,
    )
    assert result.deactivated == 0
    assert (await session.get(TourContent, items[1].content_id)).is_active


async def test_sync_only_deactivates_its_scope(session: AsyncSession) -> None:
    item = fixture_items()[0]
    others = [
        item.model_copy(update={"content_id": "other-area", "area_code": "1"}),
        item.model_copy(update={"content_id": "other-city", "sigungu_code": "99"}),
        item.model_copy(update={"content_id": "other-type", "content_type_id": "99"}),
        item.model_copy(update={"content_id": "missing"}),
    ]
    await upsert_contents(session, [item, *others])
    await session.commit()
    result = await sync_area(
        session,
        FakeTourApiClient([[item]]),
        area_code=item.area_code or "32",
        sigungu_code=item.sigungu_code,
        content_type_id=item.content_type_id,
        deactivate=True,
    )
    assert result.deactivated == 1
    for other in others[:3]:
        assert (await session.get(TourContent, other.content_id)).is_active


async def test_duplicate_items_and_reappearing_content(session: AsyncSession) -> None:
    item = fixture_items()[0]
    assert await upsert_contents(session, [item, item]) == (1, 0, 1)
    await session.commit()
    row = await session.get(TourContent, item.content_id)
    assert row is not None
    row.is_active = False
    await session.commit()
    await upsert_contents(session, [item])
    await session.commit()
    assert row.is_active
