"""공공데이터포털(data.go.kr) 공통 클라이언트.

기관이 달라도 인증·페이징·응답 봉투 규약이 같다. 그래서 이 한 곳에서
전부 처리하고, 기관별 레이어는 파라미터와 스키마만 정의한다 — ADR 007.

이 모듈은 app.core 외에는 아무것도 import하지 않는다. 우리 도메인 모델을
아는 것은 서비스의 책임이다.
"""

from dataclasses import dataclass
from typing import Any

import httpx

# 모든 data.go.kr API가 공유하는 성공 코드
_RESULT_OK = "0000"


class PublicDataError(RuntimeError):
    """공공데이터 API 호출 실패.

    HTTP 오류와 봉투 오류(resultCode != 0000)를 모두 이걸로 올린다.
    """

    def __init__(self, message: str, *, result_code: str | None = None) -> None:
        super().__init__(message)
        self.result_code = result_code


@dataclass(frozen=True)
class PublicDataPage:
    """한 페이지 응답. items는 원본 dict 그대로 — 해석은 기관별 레이어가 한다."""

    items: list[dict[str, Any]]
    total_count: int
    page_no: int
    num_of_rows: int

    @property
    def has_next(self) -> bool:
        return self.page_no * self.num_of_rows < self.total_count


def _parse_envelope(payload: object, page_no: int, num_of_rows: int) -> PublicDataPage:
    """response.header/body 봉투를 벗겨 items를 꺼낸다.

    주의할 점 두 가지가 있다.
    1. resultCode가 0000이 아니어도 HTTP는 200으로 온다. 상태 코드만 보면 실패를 놓친다.
    2. 결과가 없으면 items가 빈 객체나 빈 문자열로 온다. 리스트가 아니다.
    """
    if not isinstance(payload, dict):
        raise PublicDataError(f"예상치 못한 응답 형식입니다: {type(payload).__name__}")

    response = payload.get("response")
    if not isinstance(response, dict):
        # 인증 실패 시 포털이 봉투 없이 OpenAPI_ServiceResponse를 내려보낸다
        raise PublicDataError(f"응답에 response가 없습니다: {str(payload)[:200]}")

    header = response.get("header")
    if isinstance(header, dict):
        code = str(header.get("resultCode", ""))
        if code != _RESULT_OK:
            message = str(header.get("resultMsg", "알 수 없는 오류"))
            raise PublicDataError(f"공공데이터 API 오류 [{code}] {message}", result_code=code)

    body = response.get("body")
    if not isinstance(body, dict):
        raise PublicDataError("응답에 body가 없습니다")

    raw_items = body.get("items")
    items: list[dict[str, Any]] = []
    if isinstance(raw_items, dict):
        item = raw_items.get("item")
        if isinstance(item, list):
            items = [entry for entry in item if isinstance(entry, dict)]
        elif isinstance(item, dict):
            # 결과가 하나일 때 리스트로 감싸지 않고 내려오는 경우가 있다
            items = [item]

    return PublicDataPage(
        items=items,
        total_count=int(body.get("totalCount", len(items)) or 0),
        page_no=int(body.get("pageNo", page_no) or page_no),
        num_of_rows=int(body.get("numOfRows", num_of_rows) or num_of_rows),
    )


class PublicDataClient:
    """data.go.kr 오퍼레이션 호출기.

    serviceKey는 디코딩 키를 넣어야 한다. httpx가 쿼리 파라미터를 다시
    인코딩하므로 인코딩 키를 넣으면 이중 인코딩으로 인증에 실패한다.
    """

    def __init__(
        self,
        *,
        base_url: str,
        service_key: str,
        mobile_app: str = "ongangreung",
        timeout: float = 10.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._service_key = service_key
        self._mobile_app = mobile_app
        self._timeout = timeout
        # 테스트에서 httpx.MockTransport를 꽂기 위한 자리. httpx가 이 목적으로
        # 공식 지원하는 지점이라 전역을 건드리는 몽키패칭을 피할 수 있다.
        self._transport = transport

    async def fetch_page(
        self,
        operation: str,
        *,
        page_no: int = 1,
        num_of_rows: int = 100,
        params: dict[str, str] | None = None,
    ) -> PublicDataPage:
        query: dict[str, str] = {
            "serviceKey": self._service_key,
            "MobileOS": "ETC",
            "MobileApp": self._mobile_app,
            "_type": "json",
            "pageNo": str(page_no),
            "numOfRows": str(num_of_rows),
        }
        if params:
            query.update({k: v for k, v in params.items() if v})

        url = f"{self._base_url}/{operation}"
        async with httpx.AsyncClient(timeout=self._timeout, transport=self._transport) as http:
            try:
                response = await http.get(url, params=query)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise PublicDataError(f"{operation} 호출 실패: {exc}") from exc

            try:
                payload = response.json()
            except ValueError as exc:
                # XML 오류 페이지가 오면 여기로 떨어진다 — 대개 인증키 문제다
                raise PublicDataError(
                    f"{operation} 응답을 JSON으로 읽을 수 없습니다: {response.text[:200]}"
                ) from exc

        return _parse_envelope(payload, page_no, num_of_rows)
