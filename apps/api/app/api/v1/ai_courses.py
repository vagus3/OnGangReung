from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import CurrentUser
from app.core.config import settings
from app.db.session import get_session
from app.integrations.anthropic import CourseGenerator, build_course_generator
from app.models import User
from app.schemas.ai_course import CourseRead, CourseRequest
from app.services import ai_course as ai_course_service
from app.services import auth as auth_service

router = APIRouter(prefix="/ai/courses", tags=["ai"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
GeneratorDep = Annotated[CourseGenerator, Depends(build_course_generator)]
TokenDep = Annotated[str | None, Cookie(alias=settings.session_cookie_name)]


async def optional_user(session: SessionDep, token: TokenDep = None) -> User | None:
    """로그인은 선택이다. 없으면 코스가 사용자에 묶이지 않는다 (ADR 008)."""
    if token is None:
        return None
    return await auth_service.user_for_token(session, token)


OptionalUser = Annotated[User | None, Depends(optional_user)]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_course(
    session: SessionDep,
    generator: GeneratorDep,
    data: CourseRequest,
    user: OptionalUser,
) -> CourseRead:
    return await ai_course_service.create_course(session, generator, data, user)


@router.get("")
async def list_courses(session: SessionDep, user: CurrentUser) -> list[CourseRead]:
    """히스토리는 로그인한 사용자의 것만 있다."""
    return await ai_course_service.list_courses(session, user)


@router.get("/{course_id}")
async def get_course(session: SessionDep, course_id: int, user: OptionalUser) -> CourseRead:
    return await ai_course_service.get_course(session, course_id, user)
