"""테마 코스와 그 장소들을 적재한다.

사용법:
    uv run python -m scripts.seed_themes          # 없는 것만 추가
    uv run python -m scripts.seed_themes --reset  # 테마를 지우고 다시

데이터는 scripts/data/themes.json에 있고, 디자인 캔버스에서 기계적으로 뽑았다.
33곳을 손으로 옮기면 오타가 나므로 추출 스크립트를 거쳤다.

장소는 slug로 합친다. 빵지순례의 '안목 커피거리'와 홈 레일의 '안목 커피거리'는
같은 곳이므로 새로 만들지 않고 기존 행에 상세 필드만 채운다.
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any

from sqlalchemy import delete, select

from app.db.session import SessionFactory
from app.models import Spot, Theme, ThemeSpot
from app.models.enums import SpotCategory, Zone

DATA = Path(__file__).parent / "data" / "themes.json"

# 상세 화면용 필드. 기존 장소에는 비어 있으므로 채워 넣는다.
DETAIL_FIELDS = ("about", "hours", "tip", "parking", "menu")


def load() -> dict[str, Any]:
    payload: dict[str, Any] = json.loads(DATA.read_text())
    return payload


async def _upsert_places(session: Any, places: list[dict[str, Any]]) -> tuple[int, int]:
    """slug 기준으로 장소를 만들거나 상세 필드를 채운다."""
    slugs = [p["slug"] for p in places]
    existing = {
        spot.slug: spot
        for spot in (await session.execute(select(Spot).where(Spot.slug.in_(slugs)))).scalars()
    }

    created = enriched = 0
    for row in places:
        spot = existing.get(row["slug"])
        if spot is None:
            session.add(
                Spot(
                    slug=row["slug"],
                    name=row["name"],
                    zone=Zone[row["zone"]],
                    category=SpotCategory[row["category"]],
                    editorial_desc=row["editorial_desc"],
                    tags=row["tags"],
                    lat=row["lat"],
                    lng=row["lng"],
                    **{field: row[field] for field in DETAIL_FIELDS},
                )
            )
            created += 1
            continue

        # 이미 있는 장소는 편집 문구를 덮지 않고 비어 있는 상세만 채운다
        touched = False
        for field in DETAIL_FIELDS:
            current = getattr(spot, field)
            if current in (None, "", []):
                setattr(spot, field, row[field])
                touched = True
        if touched:
            enriched += 1

    await session.flush()
    return (created, enriched)


async def _run(reset: bool) -> int:
    payload = load()

    async with SessionFactory() as session:
        if reset:
            # theme_spots는 CASCADE로 함께 지워진다. 장소는 건드리지 않는다.
            await session.execute(delete(Theme))
            await session.commit()
            print("기존 테마를 삭제했습니다 (장소는 유지).")

        created, enriched = await _upsert_places(session, payload["places"])

        spot_ids = {
            slug: spot_id
            for slug, spot_id in (await session.execute(select(Spot.slug, Spot.id))).all()
        }

        have = {slug for (slug,) in (await session.execute(select(Theme.slug))).all()}

        themes_added = links = 0
        for row in payload["themes"]:
            if row["slug"] in have:
                continue
            theme = Theme(
                slug=row["slug"],
                name=row["name"],
                name_en=row["name_en"],
                tagline=row["tagline"],
                season=row["season"],
                car_note=row["car_note"],
                body=row["body"],
                display_order=row["order"],
            )
            session.add(theme)
            await session.flush()
            for entry in row["entries"]:
                spot_id = spot_ids.get(entry["slug"])
                if spot_id is None:
                    print(f"  경고: {entry['slug']} 장소를 찾지 못해 건너뜁니다", file=sys.stderr)
                    continue
                session.add(
                    ThemeSpot(
                        theme_id=theme.id,
                        spot_id=spot_id,
                        note=entry["note"],
                        hint=entry["hint"],
                        display_order=entry["order"],
                    )
                )
                links += 1
            themes_added += 1

        await session.commit()

    print(f"장소 신규 {created} / 상세 보강 {enriched} · 테마 신규 {themes_added} / 연결 {links}")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="테마 코스 시드")
    parser.add_argument("--reset", action="store_true", help="테마를 지우고 다시 넣는다")
    args = parser.parse_args()
    sys.exit(asyncio.run(_run(args.reset)))


if __name__ == "__main__":
    main()
