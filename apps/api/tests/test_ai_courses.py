"""AI 코스 — HTTP 경계에서 검증한다.

키가 없어도 전체 경로가 돌아야 한다는 것이 설계 전제이므로(ADR 009),
여기서도 스텁 생성기로 돈다.
"""

from collections.abc import Sequence

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.integrations.anthropic import StubCourseGenerator
from app.integrations.anthropic.client import SpotBrief
from app.models import Spot
from app.models.enums import SpotCategory, Zone
from app.schemas.ai_course import (
    CourseDay,
    CourseItem,
    CourseRequest,
    GeneratedCourse,
)

SIGNUP = {
    "email": "course@example.com",
    "password": "correct-horse-battery",
    "nickname": "코스러",
}


def make_spot(slug: str, name: str, **over: object) -> Spot:
    base: dict[str, object] = {
        "slug": slug,
        "name": name,
        "zone": Zone.GYEONGPO,
        "category": SpotCategory.NATURE,
        "editorial_desc": f"{name} 설명",
        "tags": [],
        "menu": [],
        "lat": 37.8,
        "lng": 128.9,
    }
    base.update(over)
    return Spot(**base)  # type: ignore[arg-type]


async def seed_spots(factory: async_sessionmaker[AsyncSession], count: int = 6) -> None:
    async with factory() as session:
        session.add_all([make_spot(f"spot_{i}", f"장소{i}", display_order=i) for i in range(count)])
        await session.commit()


class FakeGenerator:
    """지침을 어기는 모델을 흉내 낸다 — 없는 slug를 섞어 돌려준다."""

    name = "fake"

    def generate(self, request: CourseRequest, spots: Sequence[SpotBrief]) -> GeneratedCourse:
        return GeneratedCourse(
            title="지어낸 코스",
            summary="요약",
            days=[
                CourseDay(
                    day=1,
                    title="첫날",
                    items=[
                        CourseItem(
                            spot_slug="spot_0",
                            title="진짜 장소",
                            time_label="오전 9:00",
                            duration_label="90분",
                            reason="실재함",
                        ),
                        CourseItem(
                            spot_slug="존재하지_않는_장소",
                            title="가짜",
                            time_label="낮 12:00",
                            duration_label="60분",
                            reason="지어냄",
                        ),
                    ],
                )
            ],
        )


async def test_스텁이_기간만큼_날짜를_만든다() -> None:
    spots = [make_spot(f"s{i}", f"장소{i}") for i in range(9)]
    generator = StubCourseGenerator()

    for duration, expected in (("당일치기", 1), ("1박2일", 2), ("2박3일", 3)):
        course = generator.generate(CourseRequest(duration=duration), spots)
        assert len(course.days) == expected


async def test_스텁은_주어진_장소만_고른다() -> None:
    spots = [make_spot("only", "유일한 장소")]

    course = StubCourseGenerator().generate(CourseRequest(), spots)

    slugs = {item.spot_slug for day in course.days for item in day.items}
    assert slugs == {"only"}


async def test_장소가_없으면_빈_일정이다() -> None:
    course = StubCourseGenerator().generate(CourseRequest(), [])

    assert course.days == []


async def test_코스를_생성한다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed_spots(factory)

    response = await client.post(
        "/api/v1/ai/courses",
        json={"interests": ["자연", "맛집"], "duration": "1박2일", "prompt": "처음 강릉"},
    )

    assert response.status_code == 201
    body = response.json()
    assert len(body["days"]) == 2
    assert body["generated_by"] == "stub"


async def test_응답이_스텁인지_실물인지_알려준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """숨기면 개발 중에 품질 차이를 착각한다 (ADR 009)."""
    client, factory = seeded_client
    await seed_spots(factory)

    body = (await client.post("/api/v1/ai/courses", json={})).json()

    assert body["generated_by"] in {"stub", "claude"}


async def test_일정_항목이_장소_정보를_함께_준다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """지도와 상세로 이으려면 이름과 좌표가 필요하다."""
    client, factory = seeded_client
    await seed_spots(factory)

    body = (await client.post("/api/v1/ai/courses", json={})).json()
    item = body["days"][0]["items"][0]

    assert item["spot_name"].startswith("장소")
    assert item["lat"] == 37.8


async def test_모르는_slug는_버린다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """모델이 없는 장소를 지어내도 화면의 링크가 죽으면 안 된다."""
    from app.integrations.anthropic import build_course_generator
    from app.main import app

    client, factory = seeded_client
    await seed_spots(factory)
    app.dependency_overrides[build_course_generator] = lambda: FakeGenerator()
    try:
        body = (await client.post("/api/v1/ai/courses", json={})).json()
    finally:
        del app.dependency_overrides[build_course_generator]

    slugs = [item["spot_slug"] for day in body["days"] for item in day["items"]]
    assert slugs == ["spot_0"]


async def test_로그인_없이도_만들_수_있다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed_spots(factory)

    assert (await client.post("/api/v1/ai/courses", json={})).status_code == 201


async def test_히스토리는_로그인이_필요하다(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/ai/courses")).status_code == 401


async def test_로그인하면_내_코스만_보인다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed_spots(factory)

    # 로그인 전에 만든 코스는 사용자에 묶이지 않는다
    await client.post("/api/v1/ai/courses", json={})
    await client.post("/api/v1/auth/signup", json=SIGNUP)
    await client.post("/api/v1/ai/courses", json={"prompt": "로그인 후"})

    body = (await client.get("/api/v1/ai/courses")).json()

    assert len(body) == 1


async def test_코스를_id로_읽는다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await seed_spots(factory)
    created = (await client.post("/api/v1/ai/courses", json={})).json()

    body = (await client.get(f"/api/v1/ai/courses/{created['id']}")).json()

    assert body["id"] == created["id"]
    assert body["title"] == created["title"]


async def test_없는_코스는_404다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/ai/courses/9999")

    assert response.status_code == 404
    assert response.json()["code"] == "course_not_found"


async def test_관심사는_6개를_넘을_수_없다(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/ai/courses",
        json={"interests": ["1", "2", "3", "4", "5", "6", "7"]},
    )

    assert response.status_code == 422


class _FakeMessages:
    """messages.parse만 흉내 낸다. 무엇을 보냈는지 기록한다."""

    def __init__(self, result: GeneratedCourse | None) -> None:
        self.result = result
        self.kwargs: dict[str, object] = {}

    def parse(self, **kwargs: object) -> object:
        self.kwargs = kwargs

        class _Response:
            parsed_output = self.result

        return _Response()


class _FakeAnthropic:
    def __init__(self, result: GeneratedCourse | None) -> None:
        self.messages = _FakeMessages(result)


async def test_실제_생성기는_관광지_목록을_프롬프트에_싣는다() -> None:
    """목록을 안 주면 모델이 장소를 지어낼 수밖에 없다."""
    from app.integrations.anthropic import ClaudeCourseGenerator

    expected = GeneratedCourse(title="t", summary="s", days=[])
    fake = _FakeAnthropic(expected)
    generator = ClaudeCourseGenerator(fake)  # type: ignore[arg-type]

    result = generator.generate(
        CourseRequest(interests=["자연"], duration="당일치기", prompt="조용한 곳"),
        [make_spot("spot_x", "경포대")],
    )

    assert result is expected
    prompt = str(fake.messages.kwargs["messages"])
    assert "spot_x" in prompt
    assert "경포대" in prompt
    assert "조용한 곳" in prompt
    assert "당일치기" in prompt


async def test_실제_생성기는_구조화_출력을_요구한다() -> None:
    from app.integrations.anthropic import ClaudeCourseGenerator

    fake = _FakeAnthropic(GeneratedCourse(title="t", summary="s", days=[]))
    ClaudeCourseGenerator(fake).generate(CourseRequest(), [])  # type: ignore[arg-type]

    assert fake.messages.kwargs["output_format"] is GeneratedCourse
    assert fake.messages.kwargs["model"] == "claude-opus-5"


async def test_구조화_출력이_비면_올린다() -> None:
    """화면이 빈 응답으로 깨지는 대신 오류로 드러나야 한다."""
    import pytest

    from app.integrations.anthropic import ClaudeCourseGenerator

    fake = _FakeAnthropic(None)

    with pytest.raises(RuntimeError, match="생성하지 못했습니다"):
        ClaudeCourseGenerator(fake).generate(CourseRequest(), [])  # type: ignore[arg-type]


async def test_키가_없으면_스텁을_고른다() -> None:
    from app.integrations.anthropic import StubCourseGenerator, build_course_generator

    assert isinstance(build_course_generator(), StubCourseGenerator)
