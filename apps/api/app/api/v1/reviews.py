from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.review import ReviewSummary
from app.services import review as review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def list_reviews(session: SessionDep) -> ReviewSummary:
    return await review_service.summary(session)
