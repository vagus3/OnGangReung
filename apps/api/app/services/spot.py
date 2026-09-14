"""관광지 조회.

질의는 서비스에 둔다 (이 레포에 리포지토리 레이어는 없다).
tour_content는 항상 eager load한다 — 모델이 lazy="raise"이므로 빠뜨리면
런타임에 바로 드러난다.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models import Spot
from app.models.enums import HomeRail, SpotCategory, Zone


async def list_spots(
    session: AsyncSession,
    *,
    rail: HomeRail | None = None,
    zone: Zone | None = None,
    category: SpotCategory | None = None,
    limit: int = 50,
) -> list[Spot]:
    query = select(Spot).options(selectinload(Spot.tour_content))

    if rail is not None:
        query = query.where(Spot.rail == rail)
    if zone is not None:
        query = query.where(Spot.zone == zone)
    if category is not None:
        query = query.where(Spot.category == category)

    # 편집자가 정한 노출 순서가 먼저다. 동률이면 id로 안정 정렬한다.
    query = query.order_by(Spot.display_order, Spot.id).limit(limit)
    return list((await session.execute(query)).scalars())


async def get_spot_by_slug(session: AsyncSession, slug: str) -> Spot:
    query = select(Spot).options(selectinload(Spot.tour_content)).where(Spot.slug == slug)
    spot = (await session.execute(query)).scalar_one_or_none()
    if spot is None:
        raise NotFoundError(code="spot_not_found", detail=f"Spot '{slug}' not found")
    return spot
