# SHG Template

풀스택 모노레포 템플릿입니다. Next.js 프론트엔드, Node.js 백엔드, AI 협업 구조를 사전 구성합니다.

---

## 기술 스택

| 레이어       | 기술                                                   |
| ------------ | ------------------------------------------------------ |
| 프론트엔드   | Next.js (App Router), TypeScript, React Query, Zustand |
| 모바일       | React Native (bare, 네이티브 모듈 개발 가능)           |
| 백엔드       | Node.js (Express / Fastify / NestJS), TypeScript       |
| 데이터베이스 | PostgreSQL + Prisma ORM                                |
| 인프라       | Docker, Kubernetes, Helm, GitHub Actions               |
| AI 협업      | Claude (기본), Antigravity, Codex                      |

---

## 시작하기

```bash
# 1. 템플릿 클론
git clone https://github.com/your-org/shg-template.git my-project
cd my-project

# 2. 초기 설정 (의존성 설치 + 환경변수 + DB 설정)
bash scripts/setup.sh

# 3. 개발 서버 시작
pnpm dev
```

---

## 프로젝트 구조

```
/
├── apps/
│   ├── web/          # Next.js 프론트엔드
│   ├── api/          # Node.js 백엔드
│   └── mobile/       # React Native bare (선택)
├── packages/
│   ├── ui/           # 공유 UI 컴포넌트
│   ├── types/        # 공유 TypeScript 타입
│   ├── utils/        # 공유 유틸리티
│   ├── config/       # ESLint, TSConfig 공유 설정
│   └── database/     # Prisma 스키마 및 마이그레이션
├── .ai/              # AI 협업 설정 및 규칙
├── .github/          # CI/CD 워크플로
└── scripts/          # 유틸리티 스크립트
```

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
pnpm dev              # 전체 개발 서버 시작
pnpm build            # 전체 빌드
pnpm test             # 전체 테스트
pnpm lint             # 전체 린트
pnpm type-check       # TypeScript 타입 검사
pnpm format           # 코드 포맷팅

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
