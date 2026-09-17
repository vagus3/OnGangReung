from pydantic import BaseModel, ConfigDict


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_name: str
    country: str
    rating: int
    body: str
    spot_label: str
    helpful_count: int


class ReviewSummary(BaseModel):
    """홈 카루셀이 쓰는 요약. 평균과 건수를 매번 계산하지 않도록 함께 준다."""

    count: int
    average: float
    items: list[ReviewRead]
