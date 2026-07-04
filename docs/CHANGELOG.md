# Changelog

모든 주요 변경사항을 이 파일에 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### Added

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

- AI 도구 전환: Gemini CLI(2026-06-18 서비스 중단) → Antigravity CLI(`agy`)
  — ai_config.json, ai.sh, switch_model.sh, .ai/GEMINI.md → .ai/ANTIGRAVITY.md
- scripts/ai.sh 재작성: ai_config.json의 default 모델 연동, `--list` 구현
- FSD `pages` 레이어를 `views`로 개명 (Next.js Pages Router 충돌 방지)
- 모바일 환경을 Expo에서 bare React Native로 전환 (네이티브 모듈 개발 가능)
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
