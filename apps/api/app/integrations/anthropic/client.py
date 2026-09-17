"""AI 코스 생성기.

Protocol을 먼저 두는 이유는 테스트다. 키 없이 생성 경로 전체를 검증하려면
서비스가 구현체가 아니라 계약에 의존해야 한다 (ADR 009).

이 모듈은 app.core와 자기 schemas 외에는 import하지 않는다.
"""

from collections.abc import Sequence
from typing import Protocol

from anthropic import Anthropic

from app.core.config import settings
from app.schemas.ai_course import CourseDay, CourseItem, CourseRequest, GeneratedCourse

MODEL = "claude-opus-5"

SYSTEM = """당신은 강릉 여행 일정을 짜는 사람입니다.

규칙:
- 일정의 각 칸은 반드시 주어진 관광지 목록의 slug 중 하나를 가리킵니다.
  목록에 없는 장소를 지어내지 마세요.
- 같은 날 안에서는 이동이 적은 순서로 배치하세요.
- 기간에 맞는 날짜 수만 만드세요. 당일치기는 1일, 1박2일은 2일, 2박3일은 3일입니다.
- 하루에 3~4칸이 적당합니다. 빽빽하게 채우지 마세요.
- 문체는 담백한 서술체로, 과장하지 않습니다."""


class SpotBrief(Protocol):
    """생성기가 아는 관광지의 최소 형태.

    읽기 전용 속성으로 선언한다. 쓰기 가능한 속성은 불변(invariant)이라
    list[Spot]을 Sequence[SpotBrief]로 넘길 수 없다.
    """

    @property
    def slug(self) -> str: ...
    @property
    def name(self) -> str: ...
    @property
    def category(self) -> str: ...
    @property
    def zone(self) -> str: ...
    @property
    def editorial_desc(self) -> str: ...


class CourseGenerator(Protocol):
    """서비스가 의존하는 계약."""

    name: str

    def generate(self, request: CourseRequest, spots: Sequence[SpotBrief]) -> GeneratedCourse: ...


def _day_count(duration: str) -> int:
    if duration == "당일치기":
        return 1
    if duration == "2박3일":
        return 3
    return 2


def _spot_lines(spots: Sequence[SpotBrief]) -> str:
    return "\n".join(
        f"- {s.slug} | {s.name} | {s.zone} | {s.category} | {s.editorial_desc}" for s in spots
    )


class ClaudeCourseGenerator:
    """실제 생성. 구조화 출력으로 형식을 강제한다."""

    name = "claude"

    def __init__(self, client: Anthropic) -> None:
        self._client = client

    def generate(self, request: CourseRequest, spots: Sequence[SpotBrief]) -> GeneratedCourse:
        interests = ", ".join(request.interests) if request.interests else "특별히 없음"
        ask = request.prompt.strip() or "정석 코스로 부탁합니다."

        prompt = (
            f"기간: {request.duration} ({_day_count(request.duration)}일)\n"
            f"관심사: {interests}\n"
            f"요청: {ask}\n\n"
            f"고를 수 있는 관광지:\n{_spot_lines(spots)}"
        )

        response = self._client.messages.parse(
            model=MODEL,
            max_tokens=16000,
            system=SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            output_format=GeneratedCourse,
        )
        parsed = response.parsed_output
        if parsed is None:
            # 구조화 출력이 비는 경우는 드물지만, 그때 화면이 깨지면 안 된다
            raise RuntimeError("코스를 생성하지 못했습니다")
        return parsed


class StubCourseGenerator:
    """키가 없을 때 쓰는 결정적 생성기.

    관심사와 기간으로 거르고 순서대로 담는다. 화면과 테스트가 돌아가는 것이
    목적이고, 품질을 흉내 내지 않는다. 응답의 generated_by로 구분된다.
    """

    name = "stub"

    def generate(self, request: CourseRequest, spots: Sequence[SpotBrief]) -> GeneratedCourse:
        days = _day_count(request.duration)
        per_day = 3

        picked = list(spots[: days * per_day])
        day_titles = ["호수와 바다", "시장과 골목", "별과 능선"]
        times = ["오전 9:00", "낮 12:30", "오후 3:00", "저녁 6:30"]

        built: list[CourseDay] = []
        for day in range(days):
            chunk = picked[day * per_day : (day + 1) * per_day]
            if not chunk:
                break
            built.append(
                CourseDay(
                    day=day + 1,
                    title=day_titles[day % len(day_titles)],
                    items=[
                        CourseItem(
                            spot_slug=spot.slug,
                            title=spot.name,
                            time_label=times[i % len(times)],
                            duration_label="90분",
                            reason=spot.editorial_desc,
                        )
                        for i, spot in enumerate(chunk)
                    ],
                )
            )

        interests = " · ".join(request.interests[:2]) if request.interests else "강릉"
        return GeneratedCourse(
            title=f"{interests} {request.duration}",
            summary="키가 없어 예시 일정으로 채웠습니다. 실제 추천은 API 키를 넣으면 동작합니다.",
            days=built,
        )


def build_course_generator() -> CourseGenerator:
    """키가 있으면 실물, 없으면 스텁."""
    key = settings.anthropic_api_key.strip()
    if not key:
        return StubCourseGenerator()
    return ClaudeCourseGenerator(Anthropic(api_key=key))
