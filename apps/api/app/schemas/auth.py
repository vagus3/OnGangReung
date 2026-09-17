"""인증 DTO.

받는 항목은 디자인의 profileFields와 개인정보 처리방침 고지에서 왔다.
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    # 길이만 강제한다. 문자 종류 규칙은 오히려 약한 비밀번호를 유도한다.
    password: str = Field(min_length=10, max_length=128)
    nickname: str = Field(min_length=1, max_length=40)
    phone: str | None = Field(default=None, max_length=30)
    home_region: str | None = Field(default=None, max_length=60)
    travel_style: str | None = Field(default=None, max_length=60)
    # 광고성 정보 수신은 명시적 동의가 원칙이라 기본이 거짓이다
    noti_marketing: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class NotificationSettings(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    weather: bool
    festival: bool
    course: bool
    emergency: bool
    marketing: bool


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    nickname: str
    phone: str | None
    home_region: str | None
    travel_style: str | None
    notifications: NotificationSettings


class ProfileUpdate(BaseModel):
    nickname: str = Field(min_length=1, max_length=40)
    phone: str | None = Field(default=None, max_length=30)
    home_region: str | None = Field(default=None, max_length=60)
    travel_style: str | None = Field(default=None, max_length=60)


class NotificationUpdate(BaseModel):
    weather: bool
    festival: bool
    course: bool
    emergency: bool
    marketing: bool
