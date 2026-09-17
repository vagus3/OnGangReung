# Stack

<!-- 한국어 요약: 이 템플릿이 전제하는 기술 스택과 채택 버전의 단일 소스입니다. 기술 교체 시 확인할 체크리스트를 함께 정의합니다. -->

> 이 파일이 스택 버전의 단일 소스다. 버전을 올리거나 라이브러리를 바꾸면
> 여기를 먼저 고치고, 실제 매니페스트를 맞춘다.
>
> 선언 위치: `package.json`(루트/앱별), `apps/api/pyproject.toml`.
> 실제 잠금은 `pnpm-lock.yaml`, `apps/api/uv.lock`.

---

## 1. 런타임

| 항목    | 채택           | 선언 위치                          |
| ------- | -------------- | ---------------------------------- |
| Node.js | >=20 (CI는 22) | 루트 `engines`, `deploy.yml`       |
| pnpm    | 9.x            | 루트 `packageManager`              |
| Python  | >=3.12         | `pyproject.toml` `requires-python` |
| uv      | 최신           | `setup.sh`, `deploy.yml`           |

---

## 2. 프론트엔드 (apps/web)

| 항목            | 채택              | 역할                                     |
| --------------- | ----------------- | ---------------------------------------- |
| Next.js         | 15.3 (App Router) | 프레임워크. `views`가 FSD의 pages 레이어 |
| React           | 19.1              | 서버 컴포넌트 기준                       |
| TypeScript      | 5.4               | strict                                   |
| TanStack Query  | 5.80              | 서버 상태 전담                           |
| react-hook-form | 7.57              | 폼                                       |
| zod             | 3.25              | 환경변수/입력 검증                       |
| Tailwind CSS    | 4.3 (CSS-first)   | 스타일링. 토큰은 `@theme`. ADR 006 참조  |
| Zustand         | 5.0               | 클라이언트 상태(화면 모드). ADR 002 참조 |
| Leaflet         | 1.9               | 지도. OSM 래스터 타일, 키 불필요         |

---

## 3. 백엔드 (apps/api)

| 항목              | 채택          | 역할                                 |
| ----------------- | ------------- | ------------------------------------ |
| FastAPI           | 0.115+        | OpenAPI 자동 생성이 타입 공유의 전제 |
| SQLAlchemy        | 2.0 (asyncio) | ORM                                  |
| Alembic           | 1.16+         | 마이그레이션                         |
| asyncpg           | 0.30+         | Postgres 드라이버                    |
| pydantic-settings | 2.9+          | 설정 (`app/core/config.py`)          |
| uvicorn           | 0.34+         | ASGI 서버                            |

> NOTE: Django는 ADR 005에서 검토 후 제외했다. 이 템플릿의 핵심은
> FastAPI가 만드는 OpenAPI 스키마를 프론트 타입으로 넘기는 파이프라인이다.

---

## 4. 타입 공유 (packages/api-client)

| 항목               | 채택                         |
| ------------------ | ---------------------------- |
| openapi-typescript | 7.6+ (스키마 → TS 타입 생성) |
| openapi-fetch      | 0.13+ (타입 안전 클라이언트) |

흐름: FastAPI 스키마 → `pnpm codegen` → `openapi.json` + `src/types.ts` →
`apps/web`이 `@shg/api-client`로 소비. CI가 drift를 막는다.

---

## 5. 품질 도구

| 영역      | 도구                         | 임계치/설정                    |
| --------- | ---------------------------- | ------------------------------ |
| 타입      | tsc strict / mypy strict     | 실패 시 커밋 차단 (pre-commit) |
| 린트      | eslint 9 (flat) / ruff 0.11+ | `no-explicit-any`는 error      |
| 단위·통합 | vitest 3.2 / pytest 8.3      | 커버리지 web 15%, api 85%      |
| E2E       | Playwright 1.62 (chromium)   | `apps/web/e2e/`                |
| 포맷      | prettier 3 / ruff format     | lint-staged                    |
| 커밋      | commitlint 19 (conventional) | `.husky/commit-msg`            |
| 태스크    | turbo 2                      | `pnpm verify`가 단일 진입점    |

---

## 6. 교체 검토 주기

| 대상                      | 주기                    | 판단 기준                                                  |
| ------------------------- | ----------------------- | ---------------------------------------------------------- |
| Next / React 메이저       | 릴리스 후 1개 마이너 뒤 | 생태계(eslint-config-next, testing-library) 대응 완료 여부 |
| FastAPI / SQLAlchemy      | 분기                    | 마이그레이션 비용 대비 이득                                |
| 나머지 마이너/패치        | 분기                    | CI가 통과하면 진행                                         |
| AI CLI (`ai_config.json`) | 수시                    | 서비스 중단·대체 발표 시 즉시 (ADR 004 사례)               |

> CAUTION: 라이브러리 API를 기억에 의존해 쓰지 않는다. context7로 해당
> 버전의 실제 문서를 조회한다. 학습 데이터와 채택 버전이 어긋나는 것이
> 이 템플릿에서 가장 자주 나는 버그다.

---

## 7. 교체 체크리스트

기술을 바꾸거나 메이저를 올릴 때 순서대로 확인한다.

1. 이 파일의 해당 행을 먼저 고친다
2. 매니페스트를 맞춘다 (`package.json` / `pyproject.toml`)
3. peer 의존성이 함께 움직여야 하는지 확인한다
   (예: `vitest`와 `@vitest/coverage-v8`은 패치 버전까지 일치해야 한다)
4. `pnpm verify` 통과
5. `pnpm --filter web build`와 `pnpm --filter web test:e2e` 통과
6. 백엔드 스키마에 영향이 있으면 `pnpm codegen`
7. 아키텍처 판단이 바뀌는 교체면 `docs/adr/`에 ADR 추가
8. `docs/CHANGELOG.md`의 `### Changed`에 기록
9. 관련 `.ai/` 문서에 어긋난 서술이 없는지 확인

---

_Last Modified: 2026-09-14_
