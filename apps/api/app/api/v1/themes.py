from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.theme import ThemeDetailRead, ThemeRead
from app.services import theme as theme_service

router = APIRouter(prefix="/themes", tags=["themes"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def list_themes(session: SessionDep) -> list[ThemeRead]:
    themes = await theme_service.list_themes(session)
    return [ThemeRead.model_validate(theme) for theme in themes]


@router.get("/{slug}")
async def get_theme(session: SessionDep, slug: str) -> ThemeDetailRead:
    theme = await theme_service.get_theme_by_slug(session, slug)
    return ThemeDetailRead.from_theme(theme)
