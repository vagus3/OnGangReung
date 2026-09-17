"""AI 코스 DTO.

일정 항목이 spot_slug를 무는 것이 핵심이다. 그래야 생성된 일정에서 지도와
장소 상세로 이어진다 (ADR 009).
"""

from pydantic import BaseModel, ConfigDict, Field

DURATIONS = ("당일치기", "1박2일", "2박3일")


class CourseItem(BaseModel):
    """일정 한 칸."""

    spot_slug: str = Field(description="반드시 주어진 관광지 목록의 slug 중 하나")
    title: str = Field(description="이 칸의 제목. 장소 이름과 달라도 된다")
    time_label: str = Field(description="오전 9:00 처럼 사람이 읽는 시각")
    duration_label: str = Field(description="80분 처럼 사람이 읽는 소요 시간")
    reason: str = Field(description="왜 이 순서에 이 장소인지 한 문장")


class CourseDay(BaseModel):
    day: int = Field(ge=1, le=3)
    title: str = Field(description="그 날을 한 마디로. 예: 호수와 바다")
    items: list[CourseItem]


class GeneratedCourse(BaseModel):
    """LLM이 돌려주는 구조. 구조화 출력으로 이 형태를 강제한다."""

    title: str = Field(description="코스 제목. 22자 이내")
    summary: str = Field(description="이 코스가 어떤 하루인지 두 문장 이내")
    days: list[CourseDay]


class CourseRequest(BaseModel):
    interests: list[str] = Field(default_factory=list, max_length=6)
    duration: str = Field(default="1박2일")
    prompt: str = Field(default="", max_length=500)


class CourseItemRead(CourseItem):
    """응답용. 화면이 바로 쓸 수 있게 장소 정보를 붙인다."""

    model_config = ConfigDict(from_attributes=True)

    spot_name: str
    lat: float | None
    lng: float | None


class CourseDayRead(BaseModel):
    day: int
    title: str
    items: list[CourseItemRead]


class CourseRead(BaseModel):
    id: int
    title: str
    summary: str
    duration: str
    days: list[CourseDayRead]
    # 스텁인지 실물인지 숨기지 않는다 (ADR 009)
    generated_by: str
