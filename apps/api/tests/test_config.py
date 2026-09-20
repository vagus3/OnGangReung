"""Settings.database_url이 관리형 Postgres URL을 asyncpg 드라이버로 맞추는지 확인."""

from app.core.config import Settings


def test_plain_postgresql_url_gets_asyncpg_driver() -> None:
    settings = Settings(database_url="postgresql://u:p@host:5432/db")
    assert settings.database_url == "postgresql+asyncpg://u:p@host:5432/db"


def test_postgres_scheme_url_gets_asyncpg_driver() -> None:
    settings = Settings(database_url="postgres://u:p@host:5432/db")
    assert settings.database_url == "postgresql+asyncpg://u:p@host:5432/db"


def test_asyncpg_url_is_left_unchanged() -> None:
    url = "postgresql+asyncpg://u:p@host:5432/db"
    assert Settings(database_url=url).database_url == url


def test_sqlite_url_is_left_unchanged() -> None:
    url = "sqlite+aiosqlite:///./test.db"
    assert Settings(database_url=url).database_url == url
