# Changelog

모든 주요 변경사항을 이 파일에 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### Fixed

- 코드 리뷰 반영: 중복 생성 파일(` 2.` 접미사) 4개 제거
- env.ts에 NODE_ENV zod 스키마 추가 (컴포넌트의 process.env 직접 접근 방지)
- turbo.json test 태스크의 불필요한 build 의존성 제거 (단위 테스트는 빌드
  결과물에 의존하지 않아 pnpm test가 항상 느려지는 문제)
- README 기술 스택 표의 Zustand 표기 정정 (실제로는 미설치 상태였음, 클라이언트
  상태 필요 시 도입 예정으로 명시)
- QueryClient 생성 로직을 shared/api/queryClient.ts 팩토리로 분리 (모듈
  싱글턴 대신 팩토리로 두어 테스트/스토리북 재사용성 확보, 서버 컴포넌트
  렌더링 시 요청 간 캐시 공유 위험도 예방)

### Added

- FastAPI 백엔드 스캐폴드 (apps/api): posts CRUD, SQLAlchemy 2.0 async,
  Alembic 마이그레이션, pytest 테스트, uv 기반 의존성 관리
- Next.js 15 웹 스캐폴드 (apps/web): FSD 구조, posts 예시 도메인,
  React Query + zod 환경변수 검증, Vitest 테스트
- OpenAPI 타입 공유 파이프라인 (packages/api-client): pnpm codegen +
  CI drift 검사
- packages/config: 공유 TSConfig 베이스
- Dockerfile(web/api) + docker-compose full 프로파일
- ADR 005: 백엔드 Node.js → Python(FastAPI) 전환 및 웹 전용 템플릿화
- 초기 템플릿 구조 설정
- FSD 기반 아키텍처 가이드 (.ai/rules/ARCHITECTURE.md)
- Docker/Kubernetes 배포 가이드 (.ai/rules/INFRA.md)
- AI 협업 규칙 및 모델별 가이드
- GitHub Actions CI/CD 파이프라인
- pnpm-workspace.yaml (pnpm은 package.json workspaces를 읽지 않음)
- 루트 AI 컨텍스트 스텁: CLAUDE.md (Claude Code), AGENTS.md (Codex/Antigravity)
- .env.example, docker-compose.yml (로컬 Postgres), LICENSE (MIT)
- ADR 004: Gemini CLI → Antigravity CLI 전환 기록
- turbo.json에 clean 태스크 정의

### Changed

- 백엔드 스택: Node.js + Prisma → FastAPI + SQLAlchemy/Alembic
- 범위 축소: React Native 모바일 제거 (웹 전용), packages/ui·types·utils·
  database 제거
- .ai 문서(ARCHITECTURE/DATABASE/TEST/INFRA/core CLAUDE.md)를 Python 백엔드
  기준으로 재작성
- setup.sh: uv 설치 확인 + uv sync + Alembic 마이그레이션으로 전환
- CI: uv 셋업 추가, turbo 태스크가 ruff/mypy/pytest 커버, codegen drift 검사
- AI 도구 전환: Gemini CLI(2026-06-18 서비스 중단) → Antigravity CLI(`agy`)
  — ai_config.json, ai.sh, switch_model.sh, .ai/GEMINI.md → .ai/ANTIGRAVITY.md
- scripts/ai.sh 재작성: ai_config.json의 default 모델 연동, `--list` 구현
- FSD `pages` 레이어를 `views`로 개명 (Next.js Pages Router 충돌 방지)
- 모바일 환경을 Expo에서 bare React Native로 전환 후 웹 전용화로 제거
- REVIEW.md에 커밋 메시지(commitlint)/브랜치 전략 문서화, DESIGN.md 표 중심 압축
- .ai/ 문서 전반의 bold 마커 제거 (MODEL_RULE.md 작성 규칙 준수)

### Fixed

- ARCHITECTURE.md의 FSD 위반 예제 수정: shared/api/client.ts가 features/auth를
  import하던 것을 shared/api/token.ts 모듈로 교체
- deploy.yml 테스트 커버리지 인자 전달 오류 (`pnpm test -- --coverage`)
- npm 기반 ci.yml 제거 (pnpm 레포에서 실패, deploy.yml CI job과 중복)

---

## 형식 안내

각 버전은 아래 섹션 중 해당하는 것만 포함합니다:

- Added: 새로운 기능
- Changed: 기존 기능 변경
- Deprecated: 곧 제거될 기능
- Removed: 제거된 기능
- Fixed: 버그 수정
- Security: 보안 취약점 수정
