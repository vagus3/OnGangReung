"""테마 코스 조회 API — HTTP 경계에서 검증한다 (TEST.md)."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models import Spot, Theme, ThemeSpot
from app.models.enums import SpotCategory, Zone


def make_theme(**overrides: object) -> Theme:
    base: dict[str, object] = {
        "slug": "bread",
        "name": "빵지순례",
        "name_en": "BREAD ROUTE",
        "tagline": "마늘빵과 감자빵을 하루에 다 돕니다.",
        "season": "사계절",
        "car_note": "차 없이 가능",
        "body": "강릉도 빵으로 하루가 됩니다.",
    }
    base.update(overrides)
    return Theme(**base)  # type: ignore[arg-type]


def make_spot(slug: str, name: str, **overrides: object) -> Spot:
    base: dict[str, object] = {
        "slug": slug,
        "name": name,
        "zone": Zone.CITY,
        "category": SpotCategory.FOOD,
        "editorial_desc": "설명",
        "tags": [],
        "menu": [],
    }
    base.update(overrides)
    return Spot(**base)  # type: ignore[arg-type]


async def test_빈_목록을_돌려준다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/themes")

    assert response.status_code == 200
    assert response.json() == []


async def test_목록은_display_order로_정렬된다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    async with factory() as session:
        session.add_all(
            [
                make_theme(slug="c", name="셋", display_order=3),
                make_theme(slug="a", name="하나", display_order=1),
                make_theme(slug="b", name="둘", display_order=2),
            ]
        )
        await session.commit()

    body = (await client.get("/api/v1/themes")).json()

    assert [row["slug"] for row in body] == ["a", "b", "c"]


async def test_목록에는_본문과_장소가_없다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """카드에 필요한 것만 내려준다. 8개 테마의 장소를 다 실으면 낭비다."""
    client, factory = seeded_client
    async with factory() as session:
        session.add(make_theme())
        await session.commit()

    body = (await client.get("/api/v1/themes")).json()

    assert "body" not in body[0]
    assert "entries" not in body[0]


async def test_상세는_장소를_순서대로_내려준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    async with factory() as session:
        theme = make_theme()
        first = make_spot("spot_a", "강릉샌드 매장")
        second = make_spot("spot_b", "마늘빵 베이커리")
        session.add_all([theme, first, second])
        await session.flush()
        session.add_all(
            [
                ThemeSpot(
                    theme_id=theme.id,
                    spot_id=second.id,
                    note="두 번째",
                    hint="오후 품절",
                    display_order=2,
                ),
                ThemeSpot(
                    theme_id=theme.id,
                    spot_id=first.id,
                    note="첫 번째",
                    hint="역 도보 2분",
                    display_order=1,
                ),
            ]
        )
        await session.commit()

    body = (await client.get("/api/v1/themes/bread")).json()

    assert body["body"] == "강릉도 빵으로 하루가 됩니다."
    assert [entry["note"] for entry in body["entries"]] == ["첫 번째", "두 번째"]
    assert [entry["spot"]["name"] for entry in body["entries"]] == [
        "강릉샌드 매장",
        "마늘빵 베이커리",
    ]


async def test_테마_맥락의_서술은_장소_밖에_있다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """note는 장소의 속성이 아니라 이 테마에서의 서술이다.

    연결 테이블을 쓴 이유가 이것이므로 응답 구조에서도 분리돼 있어야 한다.
    """
    client, factory = seeded_client
    async with factory() as session:
        theme = make_theme()
        spot = make_spot("spot_a", "강릉샌드 매장", editorial_desc="장소 자체의 설명")
        session.add_all([theme, spot])
        await session.flush()
        session.add(
            ThemeSpot(
                theme_id=theme.id,
                spot_id=spot.id,
                note="기차에서 먹을 것을 미리 삽니다.",
                hint=None,
                display_order=1,
            )
        )
        await session.commit()

    entry = (await client.get("/api/v1/themes/bread")).json()["entries"][0]

    assert entry["note"] == "기차에서 먹을 것을 미리 삽니다."
    assert entry["hint"] is None
    assert entry["spot"]["editorial_desc"] == "장소 자체의 설명"


async def test_장소가_없는_테마도_조회된다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    async with factory() as session:
        session.add(make_theme())
        await session.commit()

    body = (await client.get("/api/v1/themes/bread")).json()

    assert body["entries"] == []


async def test_없는_slug는_404다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/themes/없음")

    assert response.status_code == 404
    assert response.json()["code"] == "theme_not_found"
