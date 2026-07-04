# =============================================================================
# apps/api Dockerfile — FastAPI (Python 3.12 + uv)
# 빌드 컨텍스트는 모노레포 루트: docker build -f apps/api/Dockerfile .
# =============================================================================

FROM python:3.12-slim

# uv 바이너리만 공식 이미지에서 복사 (pip 불필요)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# 의존성 레이어 분리 — 소스만 바뀌면 캐시 재사용
COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN uv sync --frozen --no-dev

COPY apps/api/ .

EXPOSE 8000

# 마이그레이션은 컨테이너 시작과 분리해 명시적으로 실행:
#   docker compose --profile full run --rm api uv run --no-sync alembic upgrade head
CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
