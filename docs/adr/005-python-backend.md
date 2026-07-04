# 005. 백엔드 Node.js → Python(FastAPI) 전환 및 웹 전용 템플릿화

날짜: 2026-07-05
상태: Accepted

## 배경 (Context)

AI/데이터 생태계가 Python 중심으로 재편되면서, AI 기능(LLM 호출, 데이터 처리,
모델 서빙)을 백엔드에 붙이기 쉬운 스택이 필요해졌습니다. 기존 템플릿은
Node.js(Express/NestJS) 백엔드와 Prisma를 가정했으나 실제 코드는 없는
문서 전용 상태였고, React Native 모바일까지 포함해 범위가 넓었습니다.

## 선택지 (Options)

1. Node.js 백엔드 유지
   - 장점: 단일 언어(TS), 타입 공유가 패키지 import로 단순
   - 단점: AI 생태계(LangChain, ML 라이브러리)와의 거리, Python 학습 기회 없음

2. Python FastAPI 백엔드 + OpenAPI 타입 공유
   - 장점: AI 생태계 직결, Pydantic 타입 안전, OpenAPI 자동 생성으로
     TS 타입 자동 공유 가능, async 기본
   - 단점: 두 언어 도구 체인 공존(pnpm + uv), 코드젠 파이프라인 필요

3. Django + DRF
   - 장점: 어드민/ORM/인증 내장
   - 단점: 무겁고 템플릿+AI 용도에 과함, OpenAPI 지원이 FastAPI 대비 약함

## 결정 (Decision)

FastAPI(Python 3.12) 백엔드를 채택하고 모노레포를 유지합니다.

- 의존성 관리: `uv` (pyproject.toml + uv.lock)
- ORM/마이그레이션: SQLAlchemy 2.0 (async) + Alembic — Prisma 제거
- 타입 공유: FastAPI OpenAPI 스키마 → `openapi-typescript` →
  `packages/api-client` (openapi-fetch 클라이언트). CI가 codegen drift를 차단
- Turborepo 연동: apps/api에 얇은 package.json shim
  (dev/lint/type-check/test가 uv run을 위임 호출)
- 범위 축소: React Native 모바일 제거, 웹 전용 템플릿으로 단순화.
  `packages/ui`, `packages/types`, `packages/utils`, `packages/database`도
  제거 (단일 웹 앱 + 자동 생성 타입 체계에서는 과잉)

## 결과 (Consequences)

긍정적:

- 백엔드 API 변경 → `pnpm codegen` → 프론트 컴파일 에러로 즉시 감지되는
  엔드투엔드 타입 안전 확보 (한 커밋 원자성)
- AI 기능 추가 시 Python 생태계를 백엔드에서 바로 활용 가능
- 템플릿 표면적 축소 — clone 후 `pnpm dev` 한 번으로 풀스택 실행

부정적:

- 개발자가 두 도구 체인(pnpm/uv, eslint/ruff, tsc/mypy)을 모두 알아야 함
- 스키마 변경 시 codegen 실행을 잊으면 CI에서 실패 (의도된 마찰)

향후 고려사항:

- 인증(auth) 패턴 추가 시 openapi-fetch 미들웨어 + tokenStorage 패턴 적용
  (ARCHITECTURE.md Section 8 참조)
- Postgres 전용 기능 사용 시 실제 Postgres 컨테이너 기반 통합 테스트 추가
