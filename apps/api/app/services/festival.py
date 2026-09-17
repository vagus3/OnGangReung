"""축제 조회."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models import Festival
from app.models.enums import Zone


async def list_festivals(session: AsyncSession, *, zone: Zone | None = None) -> list[Festival]:
    query = select(Festival)
    if zone is not None:
        query = query.where(Festival.zone == zone)
    # 진행 중인 축제가 먼저 보여야 한다. 그 다음은 편집자가 정한 순서.
    query = query.order_by(Festival.is_now.desc(), Festival.display_order, Festival.id)
    return list((await session.execute(query)).scalars())


async def get_festival_by_slug(session: AsyncSession, slug: str) -> Festival:
    query = select(Festival).where(Festival.slug == slug)
    festival = (await session.execute(query)).scalar_one_or_none()
    if festival is None:
        raise NotFoundError(code="festival_not_found", detail=f"Festival '{slug}' not found")
    return festival
