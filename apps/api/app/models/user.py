from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    """회원.

    받는 항목은 디자인의 profileFields와 개인정보 처리방침 고지에서 왔다 —
    이름(닉네임), 이메일, 연락처, 거주 지역, 여행 성향. ADR 008 참조.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    nickname: Mapped[str] = mapped_column(String(40))
    phone: Mapped[str | None] = mapped_column(String(30))
    home_region: Mapped[str | None] = mapped_column(String(60))
    travel_style: Mapped[str | None] = mapped_column(String(60))

    # 알림 수신 동의. 마케팅만 기본 꺼짐 — 광고성 정보는 명시적 동의가 원칙이다.
    noti_weather: Mapped[bool] = mapped_column(Boolean, server_default="1", default=True)
    noti_festival: Mapped[bool] = mapped_column(Boolean, server_default="1", default=True)
    noti_course: Mapped[bool] = mapped_column(Boolean, server_default="1", default=True)
    noti_emergency: Mapped[bool] = mapped_column(Boolean, server_default="1", default=True)
    noti_marketing: Mapped[bool] = mapped_column(Boolean, server_default="0", default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Session(Base):
    """로그인 세션.

    토큰 원문이 아니라 해시를 저장한다. DB가 유출돼도 그대로 세션을 탈취할 수
    없다 — 비밀번호를 해시하는 것과 같은 이유다.
    """

    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
