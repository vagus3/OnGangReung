"""인증 — HTTP 경계에서 검증한다.

보안이 걸린 경로라 실패 쪽을 특히 본다.
"""

from datetime import UTC, datetime, timedelta

from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import settings
from app.core.security import hash_session_token
from app.models import Session, User

SIGNUP = {
    "email": "gangneung@example.com",
    "password": "correct-horse-battery",
    "nickname": "김강릉",
    "phone": "010-1234-5678",
    "home_region": "서울 마포구",
    "travel_style": "느긋하게 걷기",
}


async def signup(client: AsyncClient, **over: object) -> None:
    body = {**SIGNUP, **over}
    response = await client.post("/api/v1/auth/signup", json=body)
    assert response.status_code == 201, response.text


async def test_가입하면_사용자_정보를_돌려준다(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/signup", json=SIGNUP)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "gangneung@example.com"
    assert body["nickname"] == "김강릉"


async def test_응답에_비밀번호가_들어가지_않는다(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/signup", json=SIGNUP)

    assert "password" not in response.text
    assert "password_hash" not in response.text


async def test_가입하면_바로_로그인_상태다(client: AsyncClient) -> None:
    await signup(client)

    # 쿠키가 클라이언트에 남아 다음 요청에 실린다
    assert (await client.get("/api/v1/auth/me")).status_code == 200


async def test_세션_쿠키는_httpOnly다(client: AsyncClient) -> None:
    """JS가 읽을 수 있으면 XSS로 세션이 새어나간다 (ADR 008)."""
    response = await client.post("/api/v1/auth/signup", json=SIGNUP)

    raw = response.headers["set-cookie"].lower()
    assert settings.session_cookie_name in raw
    assert "httponly" in raw
    assert "samesite=lax" in raw


async def test_이메일이_겹치면_409다(client: AsyncClient) -> None:
    await signup(client)

    response = await client.post("/api/v1/auth/signup", json=SIGNUP)

    assert response.status_code == 409
    assert response.json()["code"] == "email_taken"


async def test_이메일_대소문자를_구분하지_않는다(client: AsyncClient) -> None:
    # 구분하면 같은 사람이 두 계정을 만들게 된다
    await signup(client)

    response = await client.post(
        "/api/v1/auth/signup", json={**SIGNUP, "email": "GangNeung@Example.com"}
    )

    assert response.status_code == 409


async def test_짧은_비밀번호는_422다(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/signup", json={**SIGNUP, "password": "short"})

    assert response.status_code == 422


async def test_형식이_아닌_이메일은_422다(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/signup", json={**SIGNUP, "email": "not-an-email"})

    assert response.status_code == 422


async def test_마케팅_수신은_기본이_꺼짐이다(client: AsyncClient) -> None:
    """광고성 정보는 명시적 동의가 원칙이다."""
    response = await client.post("/api/v1/auth/signup", json=SIGNUP)

    noti = response.json()["notifications"]
    assert noti["marketing"] is False
    assert noti["weather"] is True


async def test_비밀번호가_평문으로_저장되지_않는다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await signup(client)

    async with factory() as session:
        user = (await session.execute(select(User))).scalar_one()

    assert user.password_hash != SIGNUP["password"]
    assert user.password_hash.startswith("$argon2")


async def test_세션_토큰이_평문으로_저장되지_않는다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """DB가 유출돼도 그대로 세션을 탈취할 수 없어야 한다."""
    client, factory = seeded_client
    response = await client.post("/api/v1/auth/signup", json=SIGNUP)
    token = response.cookies[settings.session_cookie_name]

    async with factory() as session:
        record = (await session.execute(select(Session))).scalar_one()

    assert record.token_hash != token
    assert record.token_hash == hash_session_token(token)


async def test_로그인하면_me를_읽을_수_있다(client: AsyncClient) -> None:
    await signup(client)
    await client.post("/api/v1/auth/logout")

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": SIGNUP["email"], "password": SIGNUP["password"]},
    )

    assert response.status_code == 200
    assert (await client.get("/api/v1/auth/me")).json()["nickname"] == "김강릉"


async def test_비밀번호가_틀리면_401이다(client: AsyncClient) -> None:
    await signup(client)

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": SIGNUP["email"], "password": "wrong-password-here"},
    )

    assert response.status_code == 401
    assert response.json()["code"] == "invalid_credentials"


async def test_없는_계정과_틀린_비밀번호를_구분해_알리지_않는다(
    client: AsyncClient,
) -> None:
    """구분하면 가입 여부를 캐낼 수 있다."""
    await signup(client)

    missing = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "correct-horse-battery"},
    )
    wrong = await client.post(
        "/api/v1/auth/login",
        json={"email": SIGNUP["email"], "password": "wrong-password-here"},
    )

    assert missing.status_code == wrong.status_code == 401
    assert missing.json() == wrong.json()


async def test_로그아웃하면_세션이_끊긴다(client: AsyncClient) -> None:
    await signup(client)

    await client.post("/api/v1/auth/logout")

    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_로그아웃은_서버에서도_세션을_지운다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    """탈퇴·로그아웃에서 즉시 끊어야 한다는 것이 세션을 서버에 둔 이유다."""
    client, factory = seeded_client
    await signup(client)
    await client.post("/api/v1/auth/logout")

    async with factory() as session:
        rows = (await session.execute(select(Session))).scalars().all()

    assert rows == []


async def test_로그인_없이_me는_401이다(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["code"] == "not_authenticated"


async def test_엉뚱한_토큰은_401이다(client: AsyncClient) -> None:
    client.cookies.set(settings.session_cookie_name, "made-up-token")

    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_만료된_세션은_거부되고_치워진다(
    seeded_client: tuple[AsyncClient, async_sessionmaker[AsyncSession]],
) -> None:
    client, factory = seeded_client
    await signup(client)

    async with factory() as session:
        record = (await session.execute(select(Session))).scalar_one()
        record.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        await session.commit()

    assert (await client.get("/api/v1/auth/me")).status_code == 401

    async with factory() as session:
        assert (await session.execute(select(Session))).scalars().all() == []


async def test_프로필을_수정한다(client: AsyncClient) -> None:
    await signup(client)

    response = await client.patch(
        "/api/v1/auth/me",
        json={
            "nickname": "강릉러",
            "phone": None,
            "home_region": "강릉시",
            "travel_style": "부지런히",
        },
    )

    assert response.status_code == 200
    assert response.json()["nickname"] == "강릉러"
    assert response.json()["phone"] is None


async def test_알림_설정을_수정한다(client: AsyncClient) -> None:
    await signup(client)

    response = await client.patch(
        "/api/v1/auth/me/notifications",
        json={
            "weather": False,
            "festival": True,
            "course": False,
            "emergency": True,
            "marketing": True,
        },
    )

    noti = response.json()["notifications"]
    assert noti["weather"] is False
    assert noti["marketing"] is True


async def test_로그인_없이는_프로필을_수정할_수_없다(client: AsyncClient) -> None:
    response = await client.patch(
        "/api/v1/auth/me",
        json={
            "nickname": "침입자",
            "phone": None,
            "home_region": None,
            "travel_style": None,
        },
    )

    assert response.status_code == 401
