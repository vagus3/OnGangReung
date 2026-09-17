"""축제 조회 API — HTTP 경계에서 검증한다."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models import Festival
from app.models.enums import Zone


def make(**over: object) -> Festival:
    base: dict[str, object] = {
        "slug": "danoje",
        "name": "단오제",
        "tagline": "유네스코 인류무형문화유산.",
        "when_label": "음력 5월 · 6월경",
        "badge": "연례",
        "zone": Zone.CITY,
        "place": "남대천 단오장",
        "about": "천년을 이어온 축제입니다.",
    }
    base.update(over)
    return Festival(**base)  # type: ignore[arg-type]


async def seed(factory: async_sessionmaker[AsyncSession], *rows: Festival) -> None:
    async with factory() as session:
        session.add_all(list(rows))
        await session.commit()


async def test_빈_목록을_돌려준다(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/festivals")).json() == []


async def test_진행_중인_축제가_먼저_온다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """지금 열리고 있는 축제를 먼저 보여주는 것이 이 목록의 목적이다."""
    client, factory = seeded_client
    await seed(
        factory,
        make(slug="a", name="먼저 등록", display_order=1, is_now=False),
        make(slug="b", name="진행 중", display_order=9, is_now=True),
    )

    body = (await client.get("/api/v1/festivals")).json()

    assert [row["slug"] for row in body] == ["b", "a"]


async def test_동률이면_display_order를_따른다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        make(slug="c", display_order=3),
        make(slug="a", display_order=1),
        make(slug="b", display_order=2),
    )

    body = (await client.get("/api/v1/festivals")).json()

    assert [row["slug"] for row in body] == ["a", "b", "c"]


async def test_권역으로_거른다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(
        factory,
        make(slug="city1", zone=Zone.CITY),
        make(slug="jum1", zone=Zone.JUMUNJIN),
    )

    body = (await client.get("/api/v1/festivals", params={"zone": "jumunjin"})).json()

    assert [row["slug"] for row in body] == ["jum1"]


async def test_목록에는_본문이_없다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(factory, make())

    assert "about" not in (await client.get("/api/v1/festivals")).json()[0]


async def test_표시용_권역_문구를_보존한다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """'시내 · 안목권'은 권역 enum에 없지만 디자인이 쓰는 문구다."""
    client, factory = seeded_client
    await seed(factory, make(zone=Zone.CITY, zone_label="시내 · 안목권"))

    body = (await client.get("/api/v1/festivals")).json()

    assert body[0]["zone"] == "city"
    assert body[0]["zone_label"] == "시내 · 안목권"


async def test_상세는_본문과_좌표를_준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed(factory, make(lat=37.75, lng=128.9, tip="새벽이 가장 쌉니다."))

    body = (await client.get("/api/v1/festivals/danoje")).json()

    assert body["about"] == "천년을 이어온 축제입니다."
    assert body["lat"] == 37.75
    assert body["tip"] == "새벽이 가장 쌉니다."


async def test_없는_slug는_404다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/festivals/없음")

    assert response.status_code == 404
    assert response.json()["code"] == "festival_not_found"
