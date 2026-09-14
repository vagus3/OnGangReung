"""TourAPI 콘텐츠를 tour_contents로 적재한다.

사용법:
    uv run python -m scripts.sync_tourapi --dry-run     # 호출과 파싱만
    uv run python -m scripts.sync_tourapi               # 실제 적재
    uv run python -m scripts.sync_tourapi --pages 3 --sigungu 1

HTTP 트리거 엔드포인트를 두지 않은 이유는 ADR 007에 있다 — 장시간 외부
호출을 요청-응답 주기에 띄우려면 인증과 백그라운드 작업 기반이 필요하다.
운영에서는 CronJob이 이 스크립트를 부른다.
"""

import argparse
import asyncio
import sys

from app.core.config import settings
from app.db.session import SessionFactory
from app.integrations.publicdata import PublicDataClient, PublicDataError
from app.integrations.tourapi import GANGWON_AREA_CODE, HttpTourApiClient
from app.services.tour_sync import sync_area


def _build_client() -> HttpTourApiClient:
    return HttpTourApiClient(
        PublicDataClient(
            base_url=settings.tourapi_base_url,
            service_key=settings.tourapi_service_key,
            mobile_app=settings.tourapi_app_name,
        )
    )


async def _run(args: argparse.Namespace) -> int:
    if not settings.tourapi_service_key:
        print(
            "TOURAPI_SERVICE_KEY가 비어 있습니다. .env에 디코딩 키를 넣어주세요.\n"
            "발급 절차는 docs/api/public-data-apis.md 4절을 보세요.",
            file=sys.stderr,
        )
        return 1

    client = _build_client()

    # 강릉 코드를 상수로 박지 않는다. 지역을 넓힐 때 막히기 때문이다.
    sigungu_code = args.sigungu
    if sigungu_code is None and args.sigungu_name:
        sigungu_code = await client.resolve_sigungu_code(
            area_code=args.area, name=args.sigungu_name
        )
        print(f"시군구 '{args.sigungu_name}' -> 코드 {sigungu_code}")

    if args.dry_run:
        items, total = await client.list_area_contents(
            area_code=args.area,
            sigungu_code=sigungu_code,
            page_no=1,
            num_of_rows=args.rows,
        )
        print(f"[dry-run] 전체 {total}건 중 첫 페이지 {len(items)}건 조회")
        for item in items[:5]:
            print(f"  {item.content_id}  {item.title}  ({item.addr1 or '주소 없음'})")
        return 0

    async with SessionFactory() as session:
        result = await sync_area(
            session,
            client,
            area_code=args.area,
            sigungu_code=sigungu_code,
            num_of_rows=args.rows,
            max_pages=args.pages,
            deactivate=args.deactivate,
        )

    print(
        f"조회 {result.fetched} / 신규 {result.created} / 갱신 {result.updated} / "
        f"변화없음 {result.skipped} / 비활성 {result.deactivated}"
    )
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="TourAPI 콘텐츠 동기화")
    parser.add_argument("--area", default=GANGWON_AREA_CODE, help="지역 코드 (기본 32=강원)")
    parser.add_argument("--sigungu", default=None, help="시군구 코드")
    parser.add_argument("--sigungu-name", default="강릉시", help="시군구 이름으로 코드 조회")
    parser.add_argument("--rows", type=int, default=100, help="페이지당 건수")
    # 개발계정 트래픽이 1,000건/일이라 기본값을 낮게 둔다
    parser.add_argument("--pages", type=int, default=5, help="최대 페이지 수")
    parser.add_argument(
        "--deactivate",
        action="store_true",
        help="이번 조회에 없는 기존 콘텐츠를 비활성 처리 (부분 동기화에는 쓰지 말 것)",
    )
    parser.add_argument("--dry-run", action="store_true", help="적재 없이 호출·파싱만")
    args = parser.parse_args()

    try:
        sys.exit(asyncio.run(_run(args)))
    except PublicDataError as exc:
        print(f"동기화 실패: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
