"""인증 — 가입·로그인·세션.

세션은 서버에 둔다. 로그아웃과 탈퇴에서 즉시 끊어야 하기 때문이다 (ADR 008).
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthError, ConflictError
from app.core.security import (
    hash_password,
    hash_session_token,
    new_session_token,
    verify_password,
)
from app.models import Session, User
from app.schemas.auth import (
    NotificationUpdate,
    ProfileUpdate,
    SignupRequest,
)

SESSION_TTL = timedelta(days=30)


def _normalize_email(email: str) -> str:
    """이메일은 대소문자를 구분하지 않는 것처럼 다룬다.

    실무에서 로컬파트는 대소문자를 구분할 수 있지만 그렇게 운용하는 서비스가
    사실상 없고, 구분하면 같은 사람이 두 계정을 만들게 된다.
    """
    return email.strip().lower()


async def signup(session: AsyncSession, data: SignupRequest) -> User:
    email = _normalize_email(data.email)
    existing = await session.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none() is not None:
        raise ConflictError(code="email_taken", detail="이미 가입된 이메일입니다")

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        nickname=data.nickname,
        phone=data.phone,
        home_region=data.home_region,
        travel_style=data.travel_style,
        noti_marketing=data.noti_marketing,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def authenticate(session: AsyncSession, email: str, password: str) -> User:
    result = await session.execute(select(User).where(User.email == _normalize_email(email)))
    user = result.scalar_one_or_none()

    # 이메일이 없을 때와 비밀번호가 틀렸을 때를 구분해 알리지 않는다.
    # 구분하면 가입 여부를 캐낼 수 있다.
    if user is None or not verify_password(password, user.password_hash):
        raise AuthError(
            code="invalid_credentials", detail="이메일 또는 비밀번호가 올바르지 않습니다"
        )
    return user


async def create_session(session: AsyncSession, user: User) -> str:
    """세션을 만들고 토큰 원문을 돌려준다. 원문은 여기서만 존재한다."""
    token = new_session_token()
    session.add(
        Session(
            token_hash=hash_session_token(token),
            user_id=user.id,
            expires_at=datetime.now(UTC) + SESSION_TTL,
        )
    )
    await session.commit()
    return token


def _as_utc(value: datetime) -> datetime:
    # SQLite는 tzinfo를 보존하지 않는다. 저장은 전부 UTC다.
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


async def user_for_token(session: AsyncSession, token: str) -> User | None:
    result = await session.execute(
        select(Session).where(Session.token_hash == hash_session_token(token))
    )
    record = result.scalar_one_or_none()
    if record is None:
        return None

    if _as_utc(record.expires_at) <= datetime.now(UTC):
        # 만료된 세션은 그 자리에서 치운다
        await session.delete(record)
        await session.commit()
        return None

    return await session.get(User, record.user_id)


async def revoke_session(session: AsyncSession, token: str) -> None:
    await session.execute(delete(Session).where(Session.token_hash == hash_session_token(token)))
    await session.commit()


async def update_profile(session: AsyncSession, user: User, data: ProfileUpdate) -> User:
    user.nickname = data.nickname
    user.phone = data.phone
    user.home_region = data.home_region
    user.travel_style = data.travel_style
    await session.commit()
    await session.refresh(user)
    return user


async def update_notifications(session: AsyncSession, user: User, data: NotificationUpdate) -> User:
    user.noti_weather = data.weather
    user.noti_festival = data.festival
    user.noti_course = data.course
    user.noti_emergency = data.emergency
    user.noti_marketing = data.marketing
    await session.commit()
    await session.refresh(user)
    return user
