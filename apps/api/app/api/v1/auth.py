from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuthError
from app.db.session import get_session
from app.models import User
from app.schemas.auth import (
    LoginRequest,
    NotificationSettings,
    NotificationUpdate,
    ProfileUpdate,
    SignupRequest,
    UserRead,
)
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
TokenDep = Annotated[str | None, Cookie(alias=settings.session_cookie_name)]

_MAX_AGE = int(auth_service.SESSION_TTL.total_seconds())


def _to_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        phone=user.phone,
        home_region=user.home_region,
        travel_style=user.travel_style,
        notifications=NotificationSettings(
            weather=user.noti_weather,
            festival=user.noti_festival,
            course=user.noti_course,
            emergency=user.noti_emergency,
            marketing=user.noti_marketing,
        ),
    )


def _set_cookie(response: Response, token: str) -> None:
    # httpOnly라 JS가 읽을 수 없다. XSS로 토큰이 새지 않는다 (ADR 008).
    response.set_cookie(
        settings.session_cookie_name,
        token,
        max_age=_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=settings.session_cookie_secure,
        path="/",
    )


async def current_user(session: SessionDep, token: TokenDep = None) -> User:
    if token is None:
        raise AuthError(code="not_authenticated", detail="로그인이 필요합니다")
    user = await auth_service.user_for_token(session, token)
    if user is None:
        raise AuthError(code="not_authenticated", detail="로그인이 필요합니다")
    return user


CurrentUser = Annotated[User, Depends(current_user)]


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(session: SessionDep, data: SignupRequest, response: Response) -> UserRead:
    user = await auth_service.signup(session, data)
    # 가입 직후 바로 로그인 상태로 둔다. 다시 로그인하게 할 이유가 없다.
    _set_cookie(response, await auth_service.create_session(session, user))
    return _to_read(user)


@router.post("/login")
async def login(session: SessionDep, data: LoginRequest, response: Response) -> UserRead:
    user = await auth_service.authenticate(session, data.email, data.password)
    _set_cookie(response, await auth_service.create_session(session, user))
    return _to_read(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(session: SessionDep, response: Response, token: TokenDep = None) -> None:
    if token is not None:
        await auth_service.revoke_session(session, token)
    response.delete_cookie(settings.session_cookie_name, path="/")


@router.get("/me")
async def me(user: CurrentUser) -> UserRead:
    return _to_read(user)


@router.patch("/me")
async def update_me(session: SessionDep, user: CurrentUser, data: ProfileUpdate) -> UserRead:
    return _to_read(await auth_service.update_profile(session, user, data))


@router.patch("/me/notifications")
async def update_notifications(
    session: SessionDep, user: CurrentUser, data: NotificationUpdate
) -> UserRead:
    return _to_read(await auth_service.update_notifications(session, user, data))
