from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.enums import Zone
from app.schemas.festival import FestivalDetailRead, FestivalRead
from app.services import festival as festival_service

router = APIRouter(prefix="/festivals", tags=["festivals"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def list_festivals(
    session: SessionDep,
    zone: Annotated[Zone | None, Query(description="권역")] = None,
) -> list[FestivalRead]:
    festivals = await festival_service.list_festivals(session, zone=zone)
    return [FestivalRead.model_validate(f) for f in festivals]


@router.get("/{slug}")
async def get_festival(session: SessionDep, slug: str) -> FestivalDetailRead:
    festival = await festival_service.get_festival_by_slug(session, slug)
    return FestivalDetailRead.model_validate(festival)
