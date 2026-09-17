"""Exercise the actual migration chain, not only metadata.create_all."""

from pathlib import Path

from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import Session

from alembic import command
from app.core.config import settings
from app.models import Base, Spot
from app.models.enums import SpotSpan, Zone


def test_migration_roundtrip_preserves_enum_rows(tmp_path: Path, monkeypatch) -> None:
    # Percent-encoded credentials/paths must survive ConfigParser interpolation.
    path = tmp_path / "migration%test.db"
    monkeypatch.setattr(settings, "database_url", f"sqlite+aiosqlite:///{path}")
    config = Config("alembic.ini")
    command.upgrade(config, "0007")
    engine = create_engine(f"sqlite:///{path}")
    try:
        with engine.begin() as conn:
            conn.execute(
                text("""
                INSERT INTO spots (slug, name, zone, category, span, rail, editorial_desc, tags)
                VALUES ('legacy', '기존 장소', 'GYEONGPO', 'NATURE', 'STD', 'BEACH', '소개', '[]')
            """)
            )
        command.upgrade(config, "head")
        with engine.begin() as conn:
            # Omit span to verify the migration's server default can be read by ORM.
            conn.execute(
                text("""
                INSERT INTO spots (slug, name, zone, category, editorial_desc, tags)
                VALUES ('default', '새 장소', 'city', 'cafe', '소개', '[]')
            """)
            )
            assert compare_metadata(MigrationContext.configure(conn), Base.metadata) == []
        with Session(engine) as session:
            spots = list(session.scalars(select(Spot).order_by(Spot.id)))
            assert [spot.zone for spot in spots] == [Zone.GYEONGPO, Zone.CITY]
            assert all(spot.span == SpotSpan.STD for spot in spots)
        command.downgrade(config, "0007")
        with engine.connect() as conn:
            assert (
                conn.execute(text("SELECT zone FROM spots WHERE slug = 'legacy'")).scalar()
                == "GYEONGPO"
            )
        command.upgrade(config, "head")
        command.downgrade(config, "base")
        command.upgrade(config, "head")
    finally:
        engine.dispose()
