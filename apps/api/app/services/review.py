"""후기 조회."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Review
from app.schemas.review import ReviewRead, ReviewSummary


async def summary(session: AsyncSession, limit: int = 10) -> ReviewSummary:
    query = select(Review).order_by(Review.helpful_count.desc(), Review.id).limit(limit)
    reviews = list((await session.execute(query)).scalars())

    count, average = (
        await session.execute(select(func.count(Review.id), func.avg(Review.rating)))
    ).one()
    return ReviewSummary(
        count=count,
        average=round(float(average or 0), 1),
        items=[ReviewRead.model_validate(r) for r in reviews],
    )
