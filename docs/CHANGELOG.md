# Changelog

모든 주요 변경사항을 이 파일에 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### Added

- Tailwind CSS v4 스타일링 레이어. 디자인 캔버스의 oklch 토큰을 `@theme`으로
  옮기고, 다크 모드는 `data-theme` 속성 변형으로 처리 (ADR 006)
- 공공데이터 연동 계층 설계와 기능별 API 지도 `docs/api/public-data-apis.md`.
  TourAPI 외에 기상청·TAGO가 별도 연동으로 필요하다는 점을 명시 (ADR 007)
- `shared/ui` 공통 컴포넌트 (Button/Chip/Card/Rail/SectionHeading)
- `tour_contents`(외부 미러) · `spots`(편집 엔티티) 테이블과 마이그레이션 0002
- 공공데이터 공통 클라이언트 `app/integrations/publicdata`와 TourAPI 레이어.
  인증·페이징·봉투 파싱을 한 곳에서 처리해 기관 추가가 스키마 정의로 끝난다
- TourAPI 동기화 서비스와 CLI (`uv run python -m scripts.sync_tourapi`).
  API 키 없이도 픽스처로 적재 경로 전체를 검증한다
- 관광지 조회 API `GET /api/v1/spots`, `GET /api/v1/spots/{slug}`.
  편집 필드와 TourAPI 사실 필드를 합쳐 내려주므로 클라이언트는 두 테이블로
  나뉜 것을 알 필요가 없다
- 홈 탭 — 히어로와 레일 4종(해변·먹거리·인기·야경)
- 안내 탭 — 권역 5개 선택과 권역별 관광지 목록
- 상단 네비게이션과 모바일 하단 탭바, 라이트/다크/시스템 화면 모드 전환
- 미구현 탭(AI 코스·테마·마이페이지) 자리 페이지 — 탭 구성이 디자인의
  정보구조이므로 링크를 지우는 대신 자리를 둔다
- 관광지 큐레이션 시드 `uv run python -m scripts.seed_spots`.
  TourAPI 키 없이도 화면을 확인할 수 있다
- 테마 코스 — `themes`·`theme_spots` 테이블과 조회 API, 테마 탭 목록·상세 화면.
  디자인의 테마 8개와 장소 33곳을 시드로 적재
  (`uv run python -m scripts.seed_themes`)
- 장소 상세 화면 `/spots/[slug]` — 소개, 운영시간, 메뉴·가격, 방문 팁, 주차.
  홈·안내·테마의 카드가 모두 이 화면으로 들어온다
- `spots`에 상세용 편집 필드 추가 (about/hours/tip/parking/menu)

### Known Issues

- API가 내려간 상태에서 홈/안내 탭 사이를 클릭으로 전환하면 이동이 일어나지
  않는다. `useSuspenseQuery`가 전환 중 던진 오류를 React가 전환 폐기로
  처리하기 때문이다. 직접 접근(새로고침)은 정상이며 오류 화면이 뜬다.
  API가 살아 있으면 발생하지 않는다

### Fixed

- /posts 정적 프리렌더로 인한 웹 빌드 실패 (API 없이 빌드하면 ECONNREFUSED로
  죽어 CI build 단계도 실패 상태였음). force-dynamic으로 전환
- husky v10에서 실패할 deprecated 부트스트랩 라인 제거
- 코드 리뷰 반영: 중복 생성 파일(` 2.` 접미사) 4개 제거
- env.ts에 NODE_ENV zod 스키마 추가 (컴포넌트의 process.env 직접 접근 방지)
- turbo.json test 태스크의 불필요한 build 의존성 제거 (단위 테스트는 빌드
  결과물에 의존하지 않아 pnpm test가 항상 느려지는 문제)
- README 기술 스택 표의 Zustand 표기 정정 (실제로는 미설치 상태였음, 클라이언트
  상태 필요 시 도입 예정으로 명시)
- QueryClient 생성 로직을 shared/api/queryClient.ts 팩토리로 분리 (모듈
  싱글턴 대신 팩토리로 두어 테스트/스토리북 재사용성 확보, 서버 컴포넌트
  렌더링 시 요청 간 캐시 공유 위험도 예방)
- postApi 에러 처리를 shared/api/errors.ts의 ApiError로 개선 (기존에는
  openapi-fetch의 error body를 버리고 고정 문자열만 던졌음, 이제 백엔드가
  내려주는 detail/code를 그대로 노출)
- postKeys를 entities/post/model/post.keys.ts로 분리 (usePosts.ts에 묶여
  있으면 여러 feature에서 재사용할 때 훅까지 딸려오는 구조였음)
- /posts 페이지를 서버 컴포넌트 + HydrationBoundary 프리페치로 전환
  (SEO/초기 로딩 개선). PostsList를 useSuspenseQuery 기반 클라이언트
  컴포넌트로 분리하고 shared/ui/ErrorBoundary 추가

### Added

- 검증 루프: pnpm verify 단일 진입점, pre-commit type-check,
  git push 전 검증을 강제하는 PreToolUse 훅, 미검증 소스 변경을 잡는
  Stop 훅 (.claude/hooks/)
- 커버리지 하한선 래칫: web 15%(vitest v8), api 85%(pytest-cov).
  현재 수치를 바닥으로 고정해 하락만 막고 점진 상향한다
- .claude/skills/add-domain: 도메인 추가 절차(백엔드 → codegen → 프론트)
- .claude/commands/verify, ship: CI 동등 검증과 기능 단위 커밋 분할 절차
- 서브에이전트 tools 화이트리스트, architect → scaffolder 인계 계약
- context7 플러그인을 프로젝트 설정에 선언 (라이브러리 최신 문서 조회)
- Playwright E2E (apps/web/e2e): 프로덕션 빌드를 3100 포트로 띄워 검증.
  CI에 별도 job으로 추가하고 docker-build가 이를 기다리게 연결
- .ai/STACK.md: 채택 버전, 교체 검토 주기, 업그레이드 체크리스트의 단일 소스
- docs/evals: 규칙 변경이 개선인지 확인하는 골든 태스크 4개와 체크리스트
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
