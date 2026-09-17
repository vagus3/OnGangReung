"""후기를 적재한다.

사용법: uv run python -m scripts.seed_reviews [--reset]

디자인의 후기 5건이다. 작성 기능이 붙으면 이 시드는 초기 데이터로만 남는다.
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any

from sqlalchemy import delete, func, select

from app.db.session import SessionFactory
from app.models import Review

DATA = Path(__file__).parent / "data" / "reviews.json"


async def _run(reset: bool) -> int:
    rows: list[dict[str, Any]] = json.loads(DATA.read_text())

    async with SessionFactory() as session:
        if reset:
            await session.execute(delete(Review))
            await session.commit()
            print("기존 후기를 삭제했습니다.")

        existing = (await session.execute(select(func.count()).select_from(Review))).scalar_one()
        if existing:
            print(f"이미 {existing}건이 있어 건너뜁니다.")
            return 0

        session.add_all([Review(**row) for row in rows])
        await session.commit()

    print(f"후기 {len(rows)}건 추가")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="후기 시드")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()
    sys.exit(asyncio.run(_run(args.reset)))


if __name__ == "__main__":
    main()
