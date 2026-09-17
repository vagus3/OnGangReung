"""AI 코스 생성과 보관.

생성기는 Protocol로 주입받는다. 키가 없으면 스텁이 들어온다 (ADR 009).
"""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.exceptions import NotFoundError
from app.integrations.anthropic import CourseGenerator
from app.models import AiCourse, Spot, User
from app.schemas.ai_course import (
    CourseDayRead,
    CourseItemRead,
    CourseRead,
    CourseRequest,
)

# 프롬프트에 싣는 관광지 수. 전부 넣으면 토큰이 커지고, 너무 적으면 고를 게 없다.
MAX_CONTEXT_SPOTS = 40
HISTORY_LIMIT = 8


async def _candidate_spots(session: AsyncSession) -> list[Spot]:
    query = select(Spot).order_by(Spot.display_order, Spot.id).limit(MAX_CONTEXT_SPOTS)
    return list((await session.execute(query)).scalars())


def _items_of(raw_day: dict[str, Any]) -> list[dict[str, Any]]:
    """저장된 날에서 항목 목록을 꺼낸다. 형태가 어긋나면 빈 목록으로 본다."""
    raw_items = raw_day.get("items")
    if not isinstance(raw_items, list):
        return []
    return [item for item in raw_items if isinstance(item, dict)]


def _to_read(course: AiCourse, spots_by_slug: dict[str, Spot]) -> CourseRead:
    """저장된 일정에 장소 정보를 붙여 내려준다.

    모르는 slug는 버린다. 모델이 지침을 어기고 없는 장소를 지어낼 수 있다고
    전제한다 — 그대로 내려보내면 화면에서 링크가 죽는다.
    """
    days: list[CourseDayRead] = []
    for raw_day in course.days:
        items: list[CourseItemRead] = []
        for raw in _items_of(raw_day):
            slug = str(raw.get("spot_slug", ""))
            spot = spots_by_slug.get(slug)
            if spot is None:
                continue
            items.append(
                CourseItemRead(
                    spot_slug=slug,
                    title=str(raw.get("title", spot.name)),
                    time_label=str(raw.get("time_label", "")),
                    duration_label=str(raw.get("duration_label", "")),
                    reason=str(raw.get("reason", "")),
                    spot_name=spot.name,
                    lat=spot.lat,
                    lng=spot.lng,
                )
            )
        if items:
            raw_number = raw_day.get("day")
            days.append(
                CourseDayRead(
                    day=raw_number if isinstance(raw_number, int) else len(days) + 1,
                    title=str(raw_day.get("title", "")),
                    items=items,
                )
            )

    return CourseRead(
        id=course.id,
        title=course.title,
        summary=course.summary,
        duration=course.duration,
        days=days,
        generated_by=course.generated_by,
    )


async def _read_for(session: AsyncSession, course: AiCourse) -> CourseRead:
    slugs = {str(item.get("spot_slug", "")) for day in course.days for item in _items_of(day)}
    spots = (await session.execute(select(Spot).where(Spot.slug.in_(slugs)))).scalars()
    return _to_read(course, {spot.slug: spot for spot in spots})


async def create_course(
    session: AsyncSession,
    generator: CourseGenerator,
    data: CourseRequest,
    user: User | None,
) -> CourseRead:
    spots = await _candidate_spots(session)
    generated = await run_in_threadpool(generator.generate, data, spots)

    course = AiCourse(
        user_id=user.id if user is not None else None,
        title=generated.title,
        summary=generated.summary,
        duration=data.duration,
        prompt=data.prompt,
        interests=data.interests,
        days=[day.model_dump() for day in generated.days],
        generated_by=generator.name,
    )
    session.add(course)
    await session.commit()
    await session.refresh(course)

    return _to_read(course, {spot.slug: spot for spot in spots})


async def list_courses(session: AsyncSession, user: User) -> list[CourseRead]:
    query = (
        select(AiCourse)
        .where(AiCourse.user_id == user.id)
        .order_by(AiCourse.created_at.desc(), AiCourse.id.desc())
        .limit(HISTORY_LIMIT)
    )
    courses = list((await session.execute(query)).scalars())
    return [await _read_for(session, course) for course in courses]


async def get_course(session: AsyncSession, course_id: int, user: User | None) -> CourseRead:
    course = await session.get(AiCourse, course_id)
    if course is None or (
        course.user_id is not None and (user is None or course.user_id != user.id)
    ):
        raise NotFoundError(code="course_not_found", detail=f"Course {course_id} not found")
    return await _read_for(session, course)
