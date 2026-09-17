from fastapi import Request
from fastapi.responses import JSONResponse


class NotFoundError(Exception):
    """도메인 예외 — 리소스 없음. 핸들러가 404 + 표준 에러 스키마로 변환한다."""

    def __init__(self, code: str, detail: str) -> None:
        self.code = code
        self.detail = detail


class ConflictError(Exception):
    """이미 존재하는 리소스. 409로 변환한다."""

    def __init__(self, code: str, detail: str) -> None:
        self.code = code
        self.detail = detail


class AuthError(Exception):
    """인증 실패 또는 미인증. 401로 변환한다."""

    def __init__(self, code: str, detail: str) -> None:
        self.code = code
        self.detail = detail


async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.detail, "code": exc.code})


async def conflict_handler(request: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.detail, "code": exc.code})


async def auth_handler(request: Request, exc: AuthError) -> JSONResponse:
    return JSONResponse(status_code=401, content={"detail": exc.detail, "code": exc.code})
