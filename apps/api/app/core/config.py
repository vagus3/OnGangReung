from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """환경변수 설정.

    로드 순서: 프로세스 환경변수 > apps/api/.env > 루트 .env > 기본값.
    모듈 코드에서 os.environ 직접 접근 금지 — 반드시 이 settings를 통해 읽는다.
    """

    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/app_dev"
    cors_origins: str = "http://localhost:3000"

    @field_validator("database_url")
    @classmethod
    def _use_asyncpg_driver(cls, value: str) -> str:
        # 관리형 Postgres(Render, Railway, Heroku류)가 주는 연결 문자열은
        # 전부 postgresql:// / postgres:// 스킴이다. create_async_engine은
        # 드라이버가 명시된 URL이 필요하므로 여기서 한 번만 맞춰준다 —
        # 그러지 않으면 모든 배포지마다 DATABASE_URL을 손으로 고쳐야 한다.
        if value.startswith("postgresql+asyncpg://"):
            return value
        if value.startswith("postgresql://"):
            return "postgresql+asyncpg://" + value.removeprefix("postgresql://")
        if value.startswith("postgres://"):
            return "postgresql+asyncpg://" + value.removeprefix("postgres://")
        return value

    # 공공데이터포털 (data.go.kr). 기관별로 트래픽이 따로 집계되므로 키를
    # 용도별로 나눠 둔다. 인코딩 키가 아니라 디코딩 키를 넣어야 한다 —
    # httpx가 쿼리 파라미터를 다시 인코딩하므로 이중 인코딩이 된다.
    tourapi_base_url: str = "http://apis.data.go.kr/B551011/KorService2"
    tourapi_service_key: str = ""
    tourapi_app_name: str = "ongangreung"

    # 세션 쿠키 (ADR 008). 운영에서는 secure를 켠다.
    session_cookie_name: str = "ongangreung_session"
    session_cookie_secure: bool = False

    # AI 코스 생성 (ADR 009). 비어 있으면 결정적 스텁이 대신 응답한다.
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-5"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
