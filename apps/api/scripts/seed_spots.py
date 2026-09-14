"""디자인 기준 관광지 큐레이션을 적재한다.

사용법:
    uv run python -m scripts.seed_spots          # 없는 것만 추가
    uv run python -m scripts.seed_spots --reset  # 전부 지우고 다시

여기 담긴 소개 문구·스티커·권역·태그는 공공 API에 대응물이 없는 편집
저작물이다(docs/api/public-data-apis.md 3절). TourAPI 동기화는 이 데이터를
건드리지 않는다 — tour_contents에만 쓴다.

TourAPI 키가 없어도 화면을 확인할 수 있게 하려는 목적이 크다. 키가 생기면
sync_tourapi로 미러를 채우고 tour_content_id를 이어 붙이면 사진과 주소가
따라 붙는다.
"""

import argparse
import asyncio
import sys

from sqlalchemy import delete, select

from app.db.session import SessionFactory
from app.models import Spot
from app.models.enums import HomeRail, SpotCategory, SpotSpan, Zone

SEED: list[dict[str, object]] = [
    {
        "slug": "spot_gyeongpo",
        "name": "경포호수 · 경포대",
        "zone": Zone.GYEONGPO,
        "category": SpotCategory.NATURE,
        "span": SpotSpan.WIDE,
        "rail": HomeRail.BEACH,
        "sticker": "다섯 개의 달",
        "editorial_desc": (
            "하늘, 바다, 호수, 술잔, 그대 눈동자. "
            "예부터 다섯 개의 달이 뜬다고 전해지는 강릉의 심장."
        ),
        "tags": ["호수", "일출", "벚꽃"],
        "lat": 37.7956,
        "lng": 128.9107,
        "display_order": 1,
    },
    {
        "slug": "spot_anmok",
        "name": "안목 커피거리",
        "zone": Zone.CITY,
        "category": SpotCategory.CAFE,
        "span": SpotSpan.WIDE,
        "rail": HomeRail.HOT,
        "editorial_desc": (
            "자판기 골목에서 시작해 로스터리 성지가 된 해변. "
            "통유리 너머로 안목항이 통째로 들어온다."
        ),
        "tags": ["바다뷰", "로스터리", "노을"],
        "lat": 37.7731,
        "lng": 128.9476,
        "display_order": 2,
    },
    {
        "slug": "spot_ojukheon",
        "name": "오죽헌",
        "zone": Zone.GYEONGPO,
        "category": SpotCategory.HISTORY,
        "editorial_desc": (
            "신사임당과 율곡 이이가 태어난 집. 검은 대나무가 둘러싼 조선 중기 상류 주택의 원형."
        ),
        "tags": ["문화재", "정원", "실내"],
        "lat": 37.7844,
        "lng": 128.8783,
        "display_order": 3,
    },
    {
        "slug": "spot_jeongdongjin",
        "name": "정동진",
        "zone": Zone.JEONGDONGJIN,
        "category": SpotCategory.NATURE,
        "span": SpotSpan.TALL,
        "rail": HomeRail.BEACH,
        "editorial_desc": (
            "바다와 가장 가까운 기차역. 새벽 다섯 시의 플랫폼이 이 도시에서 가장 붐빈다."
        ),
        "tags": ["일출", "기차역", "야간"],
        "lat": 37.6911,
        "lng": 129.0336,
        "display_order": 4,
    },
    {
        "slug": "spot_jumunjin",
        "name": "주문진 수산시장",
        "zone": Zone.JUMUNJIN,
        "category": SpotCategory.FOOD,
        "rail": HomeRail.FOOD,
        "editorial_desc": "배에서 갓 내린 회, 양미리와 오징어. 흥정 소리가 파도 소리보다 큰 곳.",
        "tags": ["시장", "미식", "항구"],
        "lat": 37.8925,
        "lng": 128.8300,
        "display_order": 5,
    },
    {
        "slug": "spot_chodang",
        "name": "초당순두부마을",
        "zone": Zone.GYEONGPO,
        "category": SpotCategory.FOOD,
        "span": SpotSpan.WIDE,
        "rail": HomeRail.FOOD,
        "sticker": "몽글몽글 뚝배기",
        "editorial_desc": "바닷물 간수로 굳힌 순두부. 뚝배기 뚜껑을 열면 김이 먼저 인사한다.",
        "tags": ["향토", "두부", "가족"],
        "lat": 37.7906,
        "lng": 128.9033,
        "display_order": 6,
    },
    {
        "slug": "spot_wolhwa",
        "name": "월화거리",
        "zone": Zone.CITY,
        "category": SpotCategory.DOWNTOWN,
        "rail": HomeRail.NIGHT,
        "editorial_desc": (
            "폐선된 철길 위에 얹힌 1.4km 산책로. 해가 지면 조명이 레일을 따라 켜진다."
        ),
        "tags": ["야경", "산책", "굿즈"],
        "lat": 37.7620,
        "lng": 128.8996,
        "display_order": 7,
    },
    {
        "slug": "spot_anbandegi",
        "name": "안반데기",
        "zone": Zone.DAEGWALLYEONG,
        "category": SpotCategory.NATURE,
        "rail": HomeRail.NIGHT,
        "editorial_desc": "해발 1100m 배추밭 위로 은하수가 지나간다. 강릉에서 가장 조용한 밤.",
        "tags": ["별", "고랭지", "드라이브"],
        "lat": 37.6206,
        "lng": 128.7461,
        "display_order": 8,
    },
    {
        "slug": "spot_sacheon",
        "name": "사천해변",
        "zone": Zone.JUMUNJIN,
        "category": SpotCategory.NATURE,
        "rail": HomeRail.BEACH,
        "editorial_desc": "사람이 적습니다. 파도 소리만 듣고 싶을 때.",
        "tags": ["조용함", "해변"],
        "lat": 37.8371,
        "lng": 128.8874,
        "display_order": 9,
    },
    {
        "slug": "spot_gamja_bread",
        "name": "감자빵",
        "zone": Zone.DAEGWALLYEONG,
        "category": SpotCategory.FOOD,
        "rail": HomeRail.HOT,
        "editorial_desc": "겉모양까지 감자입니다. 백화점 팝업까지 올라갔습니다.",
        "tags": ["빵", "선물"],
        "display_order": 10,
    },
]


async def _run(reset: bool) -> int:
    async with SessionFactory() as session:
        if reset:
            await session.execute(delete(Spot))
            await session.commit()
            print("기존 관광지를 모두 삭제했습니다.")

        existing = set((await session.execute(select(Spot.slug))).scalars().all())

        added = 0
        for row in SEED:
            if row["slug"] in existing:
                continue
            session.add(Spot(**row))  # type: ignore[arg-type]
            added += 1

        await session.commit()

    print(f"추가 {added}건 / 이미 있음 {len(SEED) - added}건")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="관광지 큐레이션 시드")
    parser.add_argument("--reset", action="store_true", help="기존 데이터를 지우고 다시 넣는다")
    args = parser.parse_args()
    sys.exit(asyncio.run(_run(args.reset)))


if __name__ == "__main__":
    main()
