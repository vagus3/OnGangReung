"""관광지 조회 API — HTTP 경계에서 검증한다 (TEST.md)."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models import Spot, TourContent
from app.models.enums import HomeRail, SpotCategory, SpotSpan, Zone


def make_spot(**overrides: object) -> Spot:
    base: dict[str, object] = {
        "slug": "spot_gyeongpo",
        "name": "경포호수 · 경포대",
        "zone": Zone.GYEONGPO,
        "category": SpotCategory.NATURE,
        "span": SpotSpan.STD,
        "editorial_desc": "예부터 다섯 개의 달이 뜬다고 전해지는 강릉의 심장.",
        "tags": ["호수", "일출"],
        "menu": [],
    }
    base.update(overrides)
    return Spot(**base)  # type: ignore[arg-type]


async def seed(factory: async_sessionmaker[AsyncSession], *rows: object) -> None:
    async with factory() as session:
        session.add_all(list(rows))  # type: ignore[arg-type]
        await session.commit()


async def test_빈_목록을_돌려준다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/spots")

    assert response.status_code == 200
    assert response.json() == []


async def test_목록을_돌려준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(factory, make_spot())

    response = await client.get("/api/v1/spots")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["slug"] == "spot_gyeongpo"
    assert body[0]["tags"] == ["호수", "일출"]


async def test_display_order로_정렬된다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        make_spot(slug="c", name="셋", display_order=3),
        make_spot(slug="a", name="하나", display_order=1),
        make_spot(slug="b", name="둘", display_order=2),
    )

    body = (await client.get("/api/v1/spots")).json()

    assert [row["slug"] for row in body] == ["a", "b", "c"]


async def test_rail로_거른다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        make_spot(slug="beach1", rail=HomeRail.BEACH),
        make_spot(slug="food1", rail=HomeRail.FOOD),
        make_spot(slug="none1", rail=None),
    )

    body = (await client.get("/api/v1/spots", params={"rail": "beach"})).json()

    assert [row["slug"] for row in body] == ["beach1"]


async def test_zone과_category로_거른다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        make_spot(slug="a", zone=Zone.GYEONGPO, category=SpotCategory.NATURE),
        make_spot(slug="b", zone=Zone.CITY, category=SpotCategory.NATURE),
        make_spot(slug="c", zone=Zone.GYEONGPO, category=SpotCategory.CAFE),
    )

    by_zone = (await client.get("/api/v1/spots", params={"zone": "gyeongpo"})).json()
    by_both = (
        await client.get("/api/v1/spots", params={"zone": "gyeongpo", "category": "cafe"})
    ).json()

    assert {row["slug"] for row in by_zone} == {"a", "c"}
    assert [row["slug"] for row in by_both] == ["c"]


async def test_limit을_지킨다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(factory, *[make_spot(slug=f"s{i}", display_order=i) for i in range(5)])

    body = (await client.get("/api/v1/spots", params={"limit": 2})).json()

    assert len(body) == 2


async def test_잘못된_enum_값은_422다(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/spots", params={"zone": "없는권역"})).status_code == 422


async def test_limit_범위를_벗어나면_422다(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/spots", params={"limit": 0})).status_code == 422
    assert (await client.get("/api/v1/spots", params={"limit": 999})).status_code == 422


async def test_미러가_없어도_조회된다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """안반데기처럼 TourAPI에 대응 콘텐츠가 없는 장소도 정상이어야 한다."""
    client, factory = seeded_client
    await seed(
        factory,
        make_spot(slug="spot_anbandegi", name="안반데기", lat=37.6, lng=128.7),
    )

    body = (await client.get("/api/v1/spots")).json()

    assert body[0]["image_url"] is None
    assert body[0]["lat"] == 37.6


async def test_미러가_있으면_사진과_좌표를_합쳐_내려준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        TourContent(
            content_id="126508",
            title="경포대",
            addr1="강원특별자치도 강릉시 경포로 365",
            addr2="(저동)",
            tel="033-640-4471",
            lat=37.8055,
            lng=128.8963,
            first_image="http://tong.visitkorea.or.kr/a.jpg",
        ),
    )
    await seed(factory, make_spot(tour_content_id="126508"))

    body = (await client.get("/api/v1/spots")).json()

    assert body[0]["image_url"] == "http://tong.visitkorea.or.kr/a.jpg"
    assert body[0]["lat"] == 37.8055


async def test_자체_좌표가_미러보다_우선한다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """TourAPI 좌표가 부정확한 장소를 편집자가 바로잡을 수 있어야 한다."""
    client, factory = seeded_client
    await seed(
        factory,
        TourContent(content_id="1", title="x", lat=1.0, lng=2.0),
    )
    await seed(factory, make_spot(tour_content_id="1", lat=37.9, lng=128.9))

    body = (await client.get("/api/v1/spots")).json()

    assert body[0]["lat"] == 37.9
    assert body[0]["lng"] == 128.9


async def test_상세는_주소를_합쳐_내려준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        TourContent(
            content_id="126508",
            title="경포대",
            addr1="강원특별자치도 강릉시 경포로 365",
            addr2="(저동)",
            tel="033-640-4471",
            overview="관동팔경의 하나.",
        ),
    )
    await seed(factory, make_spot(tour_content_id="126508"))

    body = (await client.get("/api/v1/spots/spot_gyeongpo")).json()

    assert body["address"] == "강원특별자치도 강릉시 경포로 365 (저동)"
    assert body["tel"] == "033-640-4471"
    assert body["overview"] == "관동팔경의 하나."


async def test_미러가_없는_상세는_사실_필드가_비어_있다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(factory, make_spot())

    body = (await client.get("/api/v1/spots/spot_gyeongpo")).json()

    assert body["address"] is None
    assert body["tel"] is None
    assert body["editorial_desc"].startswith("예부터")


async def test_없는_slug는_404다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/spots/없는곳")

    assert response.status_code == 404
    assert response.json()["code"] == "spot_not_found"


async def test_상세는_편집_필드를_함께_내려준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        make_spot(
            about="강릉역 안에 있는 매장입니다.",
            hours="07:00 – 21:00 · 연중무휴",
            tip="오후 6시 이후에는 인기 맛이 빠집니다.",
            parking="강릉역 환승주차장 · 유료",
            menu=[{"name": "강릉샌드 6입", "price": "9,800원"}],
        ),
    )

    body = (await client.get("/api/v1/spots/spot_gyeongpo")).json()

    assert body["about"] == "강릉역 안에 있는 매장입니다."
    assert body["hours"] == "07:00 – 21:00 · 연중무휴"
    assert body["parking"] == "강릉역 환승주차장 · 유료"
    assert body["menu"] == [{"name": "강릉샌드 6입", "price": "9,800원"}]


async def test_편집_필드가_비어_있어도_상세가_열린다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(factory, make_spot())

    body = (await client.get("/api/v1/spots/spot_gyeongpo")).json()

    assert body["about"] is None
    assert body["menu"] == []
