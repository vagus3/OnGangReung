"""축제를 적재한다.

사용법:
    uv run python -m scripts.seed_festivals
    uv run python -m scripts.seed_festivals --reset

데이터는 scripts/data/festivals.json이며 디자인 캔버스에서 추출했다.
TourAPI searchFestival2를 붙이면 이 시드는 초기 데이터 역할만 남는다.
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any

from sqlalchemy import delete, select

from app.db.session import SessionFactory
from app.models import Festival
from app.models.enums import Zone

DATA = Path(__file__).parent / "data" / "festivals.json"


async def _run(reset: bool) -> int:
    rows: list[dict[str, Any]] = json.loads(DATA.read_text())

    async with SessionFactory() as session:
        if reset:
            await session.execute(delete(Festival))
            await session.commit()
            print("기존 축제를 삭제했습니다.")

        have = {slug for (slug,) in (await session.execute(select(Festival.slug))).all()}

        added = 0
        for row in rows:
            if row["slug"] in have:
                continue
            session.add(
                Festival(
                    slug=row["slug"],
                    name=row["name"],
                    tagline=row["tagline"],
                    when_label=row["when_label"],
                    badge=row["badge"],
                    is_now=row["is_now"],
                    zone=Zone[row["zone"]],
                    zone_label=row["zone_label"],
                    place=row["place"],
                    about=row["about"],
                    hours=row["hours"],
                    price=row["price"],
                    tip=row["tip"],
                    lat=row["lat"],
                    lng=row["lng"],
                    display_order=row["order"],
                )
            )
            added += 1

        await session.commit()

    print(f"축제 신규 {added} / 이미 있음 {len(rows) - added}")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="축제 시드")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    sys.exit(asyncio.run(_run(args.reset)))


if __name__ == "__main__":
    main()
