"""테마 코스 조회."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models import Spot, Theme, ThemeSpot


async def list_themes(session: AsyncSession) -> list[Theme]:
    query = select(Theme).order_by(Theme.display_order, Theme.id)
    return list((await session.execute(query)).scalars())


async def get_theme_by_slug(session: AsyncSession, slug: str) -> Theme:
    """테마 하나를 장소까지 함께 읽는다.

    entries -> spot -> tour_content까지 한 번에 당겨온다. 모델이 lazy="raise"라
    중간 하나만 빠뜨려도 직렬화 시점에 바로 드러난다.
    """
    query = (
        select(Theme)
        .options(
            selectinload(Theme.entries).selectinload(ThemeSpot.spot).selectinload(Spot.tour_content)
        )
        .where(Theme.slug == slug)
    )
    theme = (await session.execute(query)).scalar_one_or_none()
    if theme is None:
        raise NotFoundError(code="theme_not_found", detail=f"Theme '{slug}' not found")
    return theme
