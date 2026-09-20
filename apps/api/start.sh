#!/bin/sh
# Render(무료 플랜)는 preDeployCommand를 지원하지 않는다. render.yaml의
# dockerCommand로 이 스크립트를 직접 실행한다 — 인라인 "sh -c '...&&...'"
# 문자열은 Render가 단일 커맨드 이름으로 오인해 "File name too long"으로
# 죽었다(따옴표가 셸 인자 구분자로 해석되지 않음). 스크립트 파일 하나를
# 가리키면 그 모호함이 없다.
set -e

uv run --no-sync alembic upgrade head
uv run --no-sync python -m scripts.seed_spots
uv run --no-sync python -m scripts.seed_themes
uv run --no-sync python -m scripts.seed_festivals
uv run --no-sync python -m scripts.seed_reviews

exec uv run --no-sync uvicorn app.main:app --host 0.0.0.0 --port 8000
