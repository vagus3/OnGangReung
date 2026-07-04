from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.post import PostCreate, PostRead
from app.services import post as post_service

router = APIRouter(prefix="/posts", tags=["posts"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def list_posts(session: SessionDep) -> list[PostRead]:
    posts = await post_service.list_posts(session)
    return [PostRead.model_validate(post) for post in posts]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_post(session: SessionDep, data: PostCreate) -> PostRead:
    post = await post_service.create_post(session, data)
    return PostRead.model_validate(post)


@router.get("/{post_id}")
async def get_post(session: SessionDep, post_id: int) -> PostRead:
    post = await post_service.get_post(session, post_id)
    return PostRead.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(session: SessionDep, post_id: int) -> None:
    await post_service.delete_post(session, post_id)
