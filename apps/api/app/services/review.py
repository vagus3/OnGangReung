"""후기 조회."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Review
from app.schemas.review import ReviewRead, ReviewSummary


async def summary(session: AsyncSession, limit: int = 10) -> ReviewSummary:
    query = select(Review).order_by(Review.helpful_count.desc(), Review.id).limit(limit)
    reviews = list((await session.execute(query)).scalars())

    if not reviews:
        return ReviewSummary(count=0, average=0.0, items=[])

    average = sum(r.rating for r in reviews) / len(reviews)
    return ReviewSummary(
        count=len(reviews),
        # 소수 한 자리면 충분하다. 별점은 정밀도가 의미를 더하지 않는다.
        average=round(average, 1),
        items=[ReviewRead.model_validate(r) for r in reviews],
    )
