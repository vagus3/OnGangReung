"""TourAPI 콘텐츠를 tour_contents 미러로 적재한다.

이 서비스는 spots를 절대 건드리지 않는다. 편집 데이터와 외부 사실을 나눠
놓은 이유가 그것이고, 그 경계를 지키는 것이 이 파일의 책임이다 — ADR 007.
"""

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.tourapi import TourApiClient, TourItem
from app.models import TourContent

# 미러에 담을 필드. TourItem과 TourContent에서 이름이 같으므로 한 곳에서 돈다.
_MIRRORED_FIELDS = (
    "content_type_id",
    "title",
    "addr1",
    "addr2",
    "zipcode",
    "area_code",
    "sigungu_code",
    "cat1",
    "cat2",
    "cat3",
    "lng",
    "lat",
    "map_level",
    "tel",
    "homepage",
    "overview",
    "first_image",
    "first_image_thumb",
)


@dataclass
class SyncResult:
    fetched: int = 0
    created: int = 0
    updated: int = 0
    skipped: int = 0
    deactivated: int = 0

    @property
    def changed(self) -> int:
        return self.created + self.updated


def _apply(content: TourContent, item: TourItem) -> None:
    for field in _MIRRORED_FIELDS:
        setattr(content, field, getattr(item, field))
    content.source_created_at = item.created_at
    content.source_modified_at = item.modified_at
    content.is_active = True


def _as_utc(value: datetime | None) -> datetime | None:
    """naive datetime을 UTC로 간주해 aware로 맞춘다.

    DateTime(timezone=True)로 선언해도 드라이버가 tzinfo를 보존한다는 보장이
    없다. SQLite는 실제로 naive로 돌려주고, 그대로 aware와 비교하면
    TypeError가 난다. 저장은 전부 UTC이므로 naive는 UTC로 읽는다.
    """
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value


def _is_stale(content: TourContent, item: TourItem) -> bool:
    """외부가 더 새로울 때만 갱신한다.

    한쪽이라도 수정 시각이 없으면 판단할 근거가 없으므로 갱신하는 쪽을 택한다.
    덮어써도 잃을 것이 없는 미러 테이블이기 때문이다.
    """
    incoming = _as_utc(item.modified_at)
    current = _as_utc(content.source_modified_at)
    if incoming is None or current is None:
        return True
    return incoming > current


async def upsert_contents(session: AsyncSession, items: list[TourItem]) -> tuple[int, int, int]:
    """content_id 기준 upsert. (created, updated, skipped)를 돌려준다.

    Postgres 전용 on_conflict_do_update를 쓰지 않는다 — 테스트가 인메모리
    SQLite로 돌기 때문이다. 페이지 단위로 기존 행을 한 번에 읽어와
    신규/변경으로 가르는 방식이 양쪽에서 동일하게 동작한다.
    """
    if not items:
        return (0, 0, 0)

    ids = [item.content_id for item in items]
    result = await session.execute(select(TourContent).where(TourContent.content_id.in_(ids)))
    existing = {row.content_id: row for row in result.scalars()}

    created = updated = skipped = 0
    for item in items:
        current = existing.get(item.content_id)
        if current is None:
            content = TourContent(content_id=item.content_id)
            _apply(content, item)
            session.add(content)
            existing[item.content_id] = content
            created += 1
        elif _is_stale(current, item):
            _apply(current, item)
            updated += 1
        else:
            current.is_active = True
            current.synced_at = datetime.now(UTC)
            skipped += 1

    return (created, updated, skipped)


async def deactivate_missing(
    session: AsyncSession,
    seen_ids: set[str],
    *,
    area_code: str,
    sigungu_code: str | None = None,
    content_type_id: str | None = None,
) -> int:
    """이번 동기화에서 보이지 않은 행을 내린다.

    삭제하지 않는 이유는 spots가 참조하고 있을 수 있어서다. 외부에서 사라졌다고
    우리 편집 행이 끊기면 안 된다.
    """
    query = select(TourContent).where(
        TourContent.is_active.is_(True), TourContent.area_code == area_code
    )
    if sigungu_code is not None:
        query = query.where(TourContent.sigungu_code == sigungu_code)
    if content_type_id is not None:
        query = query.where(TourContent.content_type_id == content_type_id)
    result = await session.execute(query)
    count = 0
    for content in result.scalars():
        if content.content_id not in seen_ids:
            content.is_active = False
            content.synced_at = datetime.now(UTC)
            count += 1
    return count


async def sync_area(
    session: AsyncSession,
    client: TourApiClient,
    *,
    area_code: str,
    sigungu_code: str | None = None,
    content_type_id: str | None = None,
    num_of_rows: int = 100,
    max_pages: int = 10,
    deactivate: bool = False,
) -> SyncResult:
    """지역 콘텐츠를 페이지 단위로 순회하며 미러에 적재한다.

    max_pages 기본값이 낮은 이유는 개발계정 트래픽이 1,000건/일이기 때문이다.
    전체 적재를 무심코 반복하면 즉시 고갈된다.
    """
    summary = SyncResult()
    seen: set[str] = set()
    complete = False

    for page_no in range(1, max_pages + 1):
        items, total = await client.list_area_contents(
            area_code=area_code,
            sigungu_code=sigungu_code,
            content_type_id=content_type_id,
            page_no=page_no,
            num_of_rows=num_of_rows,
        )
        if not items:
            break

        summary.fetched += len(items)
        seen.update(item.content_id for item in items)

        created, updated, skipped = await upsert_contents(session, items)
        summary.created += created
        summary.updated += updated
        summary.skipped += skipped

        if len(seen) >= total:
            complete = True
            break

    # Never deactivate unseen rows after a truncated/empty upstream response.
    if deactivate and seen and complete:
        summary.deactivated = await deactivate_missing(
            session,
            seen,
            area_code=area_code,
            sigungu_code=sigungu_code,
            content_type_id=content_type_id,
        )

    # 서비스가 커밋을 소유한다 (DATABASE.md). 라우터나 CLI는 커밋하지 않는다.
    await session.commit()
    return summary
