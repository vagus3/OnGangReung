# SHG Template

풀스택 모노레포 템플릿입니다. Next.js 프론트엔드와 FastAPI(Python) 백엔드,
OpenAPI 기반 타입 자동 공유, AI 협업 구조를 사전 구성합니다.

---

## 기술 스택

| 레이어       | 기술                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| 프론트엔드   | Next.js (App Router), TypeScript, React Query (클라이언트 상태 필요 시 Zustand 도입 예정) |
| 백엔드       | FastAPI, Python 3.12, uv, SQLAlchemy 2.0 (async)                                          |
| 타입 공유    | OpenAPI → openapi-typescript → `@shg/api-client`                                          |
| 데이터베이스 | PostgreSQL + Alembic 마이그레이션                                                         |
| 인프라       | Docker, Kubernetes, Helm, GitHub Actions                                                  |
| AI 협업      | Claude (기본), Antigravity, Codex                                                         |

---

## 시작하기

```bash
# 1. 템플릿 클론
git clone https://github.com/your-org/shg-template.git my-project
cd my-project

# 2. 초기 설정 (pnpm + uv 의존성 설치, 환경변수, DB 마이그레이션)
bash scripts/setup.sh

# 3. 로컬 Postgres 시작
docker compose up -d

# 4. 개발 서버 시작 — Next.js(3000) + FastAPI(8000) 동시 실행
pnpm dev
```

http://localhost:3000/posts 에서 예시 도메인(게시글 CRUD)의 풀스택 흐름을
확인할 수 있습니다. API 문서는 http://localhost:8000/docs (Swagger UI).

> Docker 없이 시작하려면 `.env`의 DATABASE_URL을
> `sqlite+aiosqlite:///./dev.db`로 바꾸면 됩니다.

---

## 프로젝트 구조

```
/
├── apps/
│   ├── web/          # Next.js 프론트엔드 (FSD 구조)
│   └── api/          # FastAPI 백엔드 (uv 관리, Turbo shim 연결)
├── packages/
│   ├── api-client/   # OpenAPI에서 자동 생성된 TS 타입 + 클라이언트
│   └── config/       # 공유 TSConfig
├── .ai/              # AI 협업 설정 및 규칙
├── .github/          # CI/CD 워크플로
└── scripts/          # 유틸리티 스크립트
```

## 타입 공유 흐름 (Python ↔ TypeScript)

```
FastAPI (Pydantic 스키마)
  → openapi.json 추출          pnpm --filter api export-openapi
  → TS 타입 자동 생성           packages/api-client/src/types.ts
  → 프론트에서 import          @shg/api-client (openapi-fetch)
```

백엔드 스키마를 바꾸면 `pnpm codegen` 한 번으로 프론트 타입이 갱신됩니다.
재생성을 잊으면 CI의 codegen drift 검사가 커밋을 차단합니다.

---

## AI 협업

이 템플릿은 Claude, Antigravity, Codex를 역할에 맞게 사용하도록 설계됐습니다.

> Gemini CLI는 2026-06-18 서비스가 중단되어 후속 도구인 Antigravity CLI(`agy`)로 대체했습니다.
> 배경은 `docs/adr/004-gemini-to-antigravity.md` 참조.

```bash
# 기본 모델(Claude)로 AI 실행
pnpm ai

# 특정 모델 지정 실행
pnpm ai claude
pnpm ai antigravity
pnpm ai codex

# 기본 모델 전환
pnpm ai:switch antigravity

# 현재 설정 확인
bash scripts/ai.sh --list
```

| 모델        | 주요 용도                              |
| ----------- | -------------------------------------- |
| Claude      | 아키텍처 설계, 복잡한 리팩터링, 디버깅 |
| Antigravity | 대용량 컨텍스트 분석, 문서화           |
| Codex       | 보일러플레이트, 단순 CRUD, 테스트      |

각 AI CLI는 루트의 컨텍스트 파일을 자동으로 읽습니다:

- Claude Code → `CLAUDE.md`
- Codex / Antigravity → `AGENTS.md`

두 파일 모두 `.ai/core/CLAUDE.md`(작업별 문서 라우팅 인덱스)로 연결됩니다.
상세 가이드: `.ai/` 디렉터리 참조

---

## 주요 명령어

```bash
pnpm dev              # 전체 개발 서버 (web + api)
pnpm build            # 전체 빌드
pnpm test             # 전체 테스트 (vitest + pytest)
pnpm lint             # 전체 린트 (eslint + ruff)
pnpm type-check       # 타입 검사 (tsc + mypy)
pnpm codegen          # OpenAPI → TS 타입 재생성
pnpm format           # 코드 포맷팅 (prettier)

# 백엔드 단독 작업 (apps/api에서)
uv run pytest                                      # 테스트
uv run alembic revision --autogenerate -m "..."    # 마이그레이션 생성
uv run alembic upgrade head                        # 마이그레이션 적용

bash scripts/setup.sh            # 초기 프로젝트 설정
bash scripts/switch_model.sh     # AI 모델 전환
```

---

## 문서

| 문서                | 경로                        |
| ------------------- | --------------------------- |
| 아키텍처 가이드     | `.ai/rules/ARCHITECTURE.md` |
| 인프라/배포 가이드  | `.ai/rules/INFRA.md`        |
| 디자인 시스템       | `.ai/rules/DESIGN.md`       |
| 테스트 전략         | `.ai/rules/TEST.md`         |
| 코드 리뷰 기준      | `.ai/rules/REVIEW.md`       |
| 데이터베이스 가이드 | `.ai/DATABASE.md`           |
| AI 모델 규칙        | `.ai/core/MODEL_RULE.md`    |
| 기술 결정 기록(ADR) | `docs/adr/`                 |

---

## 라이선스

MIT
