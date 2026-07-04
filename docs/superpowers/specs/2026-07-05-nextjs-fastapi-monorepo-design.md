# Next.js + FastAPI 모노레포 템플릿 설계

날짜: 2026-07-05
상태: Approved

## 1. 배경과 목표

기존 shg-Web-template은 Next.js 웹 + Node.js API + React Native 모바일을 가정한
문서 중심 모노레포 템플릿이었다. 이번 설계에서 다음과 같이 방향을 전환한다.

- 백엔드를 Node.js에서 Python(FastAPI)으로 전환한다. AI/데이터 생태계가 Python
  중심이므로, AI 기능을 붙이기 쉬운 백엔드를 기본으로 삼는다.
- 모바일(React Native)을 범위에서 제거하고 웹 전용 템플릿으로 단순화한다.
- 문서 재설계에 그치지 않고 `pnpm dev`로 즉시 실행 가능한 스캐폴드까지 만든다.

목표: clone → setup → `pnpm dev` 세 단계로 Next.js(3000) + FastAPI(8000) +
PostgreSQL이 뜨고, 예시 도메인 하나로 풀스택 데이터 흐름을 학습할 수 있는 템플릿.

## 2. 확정 결정사항

| 항목 | 결정 | 근거 |
|------|------|------|
| 레포 구조 | 모노레포 (pnpm + Turborepo) | 기존 인프라 재사용, 타입 공유 원자성, 분리 전환이 쉬운 방향 |
| 백엔드 프레임워크 | FastAPI | Pydantic 타입 안전 + OpenAPI 자동 생성 + async 기본 |
| 모바일 | 제거 (웹 전용) | 템플릿 목적 집중, 필요 시 apps/mobile 추가는 쉬움 |
| ORM / 마이그레이션 | SQLAlchemy 2.0 (async) + Alembic | Python 표준 조합, FastAPI 공식 문서 기준 |
| DB | PostgreSQL (docker-compose) | 기존 구성 유지 |
| 작업 범위 | 문서 재설계 + 실제 스캐폴드 | 즉시 실행 가능한 템플릿 완성 |

## 3. 전체 폴더 구조

```
shg-web-template/
├── apps/
│   ├── web/                  # Next.js 15 (App Router) + FSD
│   └── api/                  # Python FastAPI
├── packages/
│   ├── api-client/           # OpenAPI → TS 타입/클라이언트 자동 생성
│   └── config/               # 공유 ESLint/TSConfig
├── docker-compose.yml        # postgres + api + web
├── turbo.json
├── pnpm-workspace.yaml
├── .ai/                      # AI 규칙 문서 (Python 백엔드 기준 재작성)
└── docs/                     # ADR, 가이드
```

제거 대상 (기존 문서에서 삭제):

- `packages/ui` — 웹 앱이 하나이므로 FSD의 `apps/web/src/shared/ui`로 충분
- `packages/types`, `packages/utils` — 타입은 api-client가 자동 생성, 수동 공유 불필요
- `packages/database` (Prisma) — DB 스키마는 `apps/api`의 SQLAlchemy 모델로 이동
- `apps/mobile` 및 관련 문서(`.ai/templates/MOBILE.md`)

## 4. apps/web 구조 (변경 없음)

기존 `.ai/rules/ARCHITECTURE.md`의 FSD 구조를 그대로 유지한다.

```
apps/web/src/
├── app/          # Next.js App Router
├── views/        # FSD pages 레이어 (Next.js 충돌 회피용 이름)
├── widgets/
├── features/
├── entities/
└── shared/       # ui, api, config, lib, types
```

- 상태 관리: React Query(서버 상태) + Zustand(클라이언트 전역 상태) 유지
- API 호출: `shared/api`의 클라이언트가 `@shg/api-client`의 생성된 타입 사용
- 환경변수: `shared/config/env.ts`에서 zod 검증 유지

## 5. apps/api 구조 (FastAPI 표준 레이아웃)

```
apps/api/
├── pyproject.toml        # uv로 의존성 관리
├── package.json          # turbo 연결 shim — "dev": "uv run uvicorn app.main:app --reload --port 8000"
├── alembic.ini
├── alembic/              # DB 마이그레이션
│   └── versions/
├── app/
│   ├── main.py           # 엔트리포인트, 라우터 등록, CORS
│   ├── core/             # config.py(pydantic-settings), 로깅, 예외 핸들러
│   ├── api/
│   │   └── v1/           # 라우터 (presentation 계층)
│   ├── schemas/          # Pydantic 스키마 = 요청/응답 DTO
│   ├── services/         # 비즈니스 로직 (application 계층)
│   ├── models/           # SQLAlchemy 모델 (domain 계층)
│   └── db/               # 세션 팩토리, 리포지토리 (infrastructure 계층)
└── tests/                # pytest + httpx
```

의존성 방향 (기존 Clean Architecture 규칙 계승):

```
허용: api → services → models
      api → schemas
      db  → models
금지: models → services, api / services → api / schemas → services
```

Python 도구 체인:

| 역할 | 도구 | TS 대응 |
|------|------|---------|
| 패키지 관리 | uv | pnpm |
| 린트 + 포맷 | ruff | ESLint + Prettier |
| 타입 체크 | mypy (strict) | tsc, "no any" 규칙 대응 |
| 테스트 | pytest + pytest-asyncio + httpx | Vitest |

## 6. 타입 공유 파이프라인

이 템플릿의 핵심 메커니즘. Python과 TypeScript 사이의 타입 안전을
OpenAPI 스키마 자동 생성으로 확보한다.

```
FastAPI (Pydantic 스키마)
  → /openapi.json 자동 생성
  → pnpm codegen: openapi-typescript가 packages/api-client에 타입 생성
  → apps/web은 @shg/api-client에서 import (openapi-fetch로 타입 안전 호출)
```

- `packages/api-client`는 생성된 `types.ts`(openapi-typescript 출력)와
  얇은 `openapi-fetch` 클라이언트 팩토리만 포함한다. 수동 작성 타입 금지.
- codegen 스크립트는 실행 중인 API 서버 또는 FastAPI 앱에서 직접 추출한
  openapi.json을 입력으로 사용한다 (서버 기동 없이 추출하는 스크립트 포함).
- CI에서 codegen을 재실행하고 git diff가 발생하면 실패 처리한다.
  스키마 변경과 타입 재생성이 항상 같은 커밋에 묶이도록 강제하는 장치.

## 7. 개발 워크플로

```bash
pnpm setup                      # 의존성 설치 (pnpm install + uv sync)
docker compose up -d postgres   # DB만 컨테이너로
pnpm dev                        # turbo: Next.js(3000) + FastAPI(8000) 병렬 실행
```

- `apps/api/package.json`은 turbo가 Python 프로젝트를 오케스트레이션하기 위한
  얇은 shim이다. 실제 의존성/빌드는 pyproject.toml + uv가 담당한다.
- turbo tasks: `dev`(persistent), `lint`(ruff), `type-check`(mypy), `test`(pytest)
  를 web의 대응 태스크와 동일한 이름으로 노출해 루트 명령 한 벌로 관리한다.
- docker-compose는 프로덕션 유사 실행용으로 web/api 서비스도 정의하되,
  로컬 개발 기본 흐름은 postgres만 컨테이너로 띄운다.

## 8. 환경변수

```
.env.example (루트, 커밋됨)
├── DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/app
├── NEXT_PUBLIC_API_URL=http://localhost:8000
└── CORS_ORIGINS=http://localhost:3000
```

- 프론트: `shared/config/env.ts`에서 zod로 검증 (기존 규칙 유지)
- 백엔드: `app/core/config.py`에서 pydantic-settings로 검증 (zod와 대칭 구조)
- 컴포넌트/모듈에서 `process.env`, `os.environ` 직접 접근 금지

## 9. 예시 도메인: posts (게시글 CRUD)

풀스택 데이터 흐름을 시연하는 최소 예시 하나를 포함한다.

```
apps/api/app/models/post.py        # SQLAlchemy 모델 (id, title, content, created_at)
alembic/versions/xxx_create_posts.py
apps/api/app/schemas/post.py       # PostCreate, PostRead
apps/api/app/services/post.py      # CRUD 로직
apps/api/app/api/v1/posts.py       # GET /posts, POST /posts, GET/DELETE /posts/{id}
  → pnpm codegen
apps/web/src/entities/post/        # 생성된 타입 re-export, useQuery 훅
apps/web/src/features/post-create/ # 작성 폼 (React Hook Form)
apps/web/src/views/posts/          # 목록 + 작성 페이지
```

인증(auth)은 이번 범위에서 제외한다. 템플릿 복잡도를 낮추고,
기존 문서의 auth 패턴(tokenStorage 등)은 참고용으로 문서에만 유지한다.

## 10. 에러 핸들링

- 백엔드: 표준 에러 응답 스키마 `{ "detail": str, "code": str }`.
  도메인 예외 → HTTP 예외 매핑은 `app/core/`의 exception handler에서 일괄 처리.
- 프론트: React Query의 error 상태로 처리. 401 리다이렉트 등 전역 처리는
  기존 `shared/api` 인터셉터 패턴 유지 (fetch 래퍼로 이식).

## 11. 테스트 전략

- web: 기존 `.ai/rules/TEST.md` 유지 (Vitest + RTL, Playwright E2E)
- api: pytest + httpx AsyncClient로 라우터 단위 테스트,
  테스트 DB는 SQLite(aiosqlite) 인메모리로 고정 — 외부 의존 없이 pytest 단독 실행 가능
- 스캐폴드에는 posts 도메인의 예시 테스트를 web/api 각 1개 이상 포함

## 12. 문서 변경 목록

| 파일 | 변경 |
|------|------|
| `.ai/rules/ARCHITECTURE.md` | 백엔드 섹션 FastAPI 기준 재작성, 모바일/불필요 패키지 제거, 타입 공유 파이프라인 추가 |
| `.ai/DATABASE.md` | Prisma → SQLAlchemy 2.0 + Alembic 기준 재작성 |
| `.ai/core/CLAUDE.md` | 라우팅 테이블 갱신 (MOBILE.md 제거, Python 백엔드 반영) |
| `.ai/templates/MOBILE.md` | 삭제 |
| `.ai/rules/INFRA.md` | api 컨테이너를 Python 이미지 기준으로 갱신 |
| `.ai/rules/TEST.md` | pytest 섹션 추가 |
| `docs/adr/005-python-backend.md` | 신규 — Node → Python 전환 + 웹 전용 결정 기록 |
| `README.md` | 스택/실행 방법 갱신 |
| `.env.example`, `docker-compose.yml`, `.github/workflows/*` | Python 백엔드 반영 |
| `package.json` (루트) | 설명/스크립트 갱신 (codegen 추가 등) |

## 13. 성공 기준

1. `pnpm setup && docker compose up -d postgres && pnpm dev`로 web + api가 뜬다
2. http://localhost:3000 의 posts 페이지에서 글 작성/조회가 동작한다
3. `pnpm codegen` 실행 시 api-client 타입이 재생성되고, 백엔드 스키마 변경 시
   프론트가 컴파일 에러로 이를 감지한다
4. `pnpm lint`, `pnpm type-check`, `pnpm test`가 web/api 모두에서 통과한다
5. `.ai/` 문서가 실제 구조와 일치한다
