"""후기 조회 API."""

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models import Review


def make(**over: object) -> Review:
    base: dict[str, object] = {
        "author_name": "Sarah M.",
        "country": "미국",
        "rating": 5,
        "body": "경포호수 일출이 정말 아름다웠어요.",
        "spot_label": "경포호수",
    }
    base.update(over)
    return Review(**base)  # type: ignore[arg-type]


async def test_후기가_없으면_0이다(client: AsyncClient) -> None:
    body = (await client.get("/api/v1/reviews")).json()

    assert body["count"] == 0
    assert body["average"] == 0.0
    assert body["items"] == []


async def test_평균과_건수를_함께_준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """화면이 매번 계산하지 않도록 서버가 요약해 준다."""
    client, factory = seeded_client
    async with factory() as session:
        session.add_all([make(rating=5), make(rating=4), make(rating=5)])
        await session.commit()

    body = (await client.get("/api/v1/reviews")).json()

    assert body["count"] == 3
    assert body["average"] == 4.7


async def test_도움됨이_많은_순으로_온다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    async with factory() as session:
        session.add_all(
            [
                make(author_name="적음", helpful_count=1),
                make(author_name="많음", helpful_count=26),
            ]
        )
        await session.commit()

    body = (await client.get("/api/v1/reviews")).json()

    assert [r["author_name"] for r in body["items"]] == ["많음", "적음"]
