from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models import Post
from app.schemas.post import PostCreate


async def list_posts(session: AsyncSession) -> list[Post]:
    result = await session.execute(select(Post).order_by(Post.created_at.desc(), Post.id.desc()))
    return list(result.scalars())


async def create_post(session: AsyncSession, data: PostCreate) -> Post:
    post = Post(title=data.title, content=data.content)
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post


async def get_post(session: AsyncSession, post_id: int) -> Post:
    post = await session.get(Post, post_id)
    if post is None:
        raise NotFoundError(code="post_not_found", detail=f"Post {post_id} not found")
    return post


async def delete_post(session: AsyncSession, post_id: int) -> None:
    post = await get_post(session, post_id)
    await session.delete(post)
    await session.commit()
