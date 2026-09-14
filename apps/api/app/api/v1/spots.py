from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.enums import HomeRail, SpotCategory, Zone
from app.schemas.spot import SpotDetailRead, SpotRead
from app.services import spot as spot_service

router = APIRouter(prefix="/spots", tags=["spots"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def list_spots(
    session: SessionDep,
    rail: Annotated[HomeRail | None, Query(description="홈 레일 소속")] = None,
    zone: Annotated[Zone | None, Query(description="권역")] = None,
    category: Annotated[SpotCategory | None, Query(description="카테고리")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[SpotRead]:
    spots = await spot_service.list_spots(
        session, rail=rail, zone=zone, category=category, limit=limit
    )
    return [SpotRead.from_spot(spot) for spot in spots]


@router.get("/{slug}")
async def get_spot(session: SessionDep, slug: str) -> SpotDetailRead:
    spot = await spot_service.get_spot_by_slug(session, slug)
    return SpotDetailRead.from_spot(spot)
