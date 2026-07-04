# 온보딩 가이드

새 팀원이 프로젝트에 합류했을 때 읽는 문서입니다.
이 가이드를 따라하면 개발 환경을 설정하고 첫 기여를 할 수 있습니다.

---

## 1단계: 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-org/project.git
cd project

# 초기 설정 실행 (의존성 설치 + .env 생성 + DB 설정)
bash scripts/setup.sh
```

설정 완료 후 `.env` 파일을 열어 팀에서 공유받은 값을 입력합니다.

---

## 2단계: 개발 서버 실행

```bash
pnpm dev          # 전체 서버 (web + api)
pnpm dev:web      # 프론트엔드만
pnpm dev:api      # 백엔드만
```

---

## 3단계: 아키텍처 이해

코드 작성 전 반드시 읽어야 할 문서:

1. `.ai/rules/ARCHITECTURE.md` — 전체 구조와 FSD 레이어 규칙
2. `.ai/core/MODEL_RULE.md` — 코드 작성 규칙
3. `.ai/rules/REVIEW.md` — PR/커밋 규칙
4. `docs/adr/` — 주요 기술 결정 배경

---

## 4단계: AI 도구 설정

```bash
# 설치된 AI 모델 확인
bash scripts/ai.sh --list

# 기본 모델(Claude)로 AI 실행
pnpm ai

# 작업 유형에 따른 모델 선택
bash scripts/switch_model.sh claude        # 아키텍처/복잡한 작업
bash scripts/switch_model.sh codex         # 보일러플레이트/테스트
bash scripts/switch_model.sh antigravity   # 문서화/전체 분석
```

> NOTE: Gemini CLI는 2026-06-18 서비스 중단됐습니다. 대체 도구인 Antigravity CLI(`agy`)를
> antigravity.google/download 에서 설치하세요. 배경: `docs/adr/004-gemini-to-antigravity.md`

---

## 첫 PR 체크리스트

```
- [ ] .ai/rules/ARCHITECTURE.md의 레이어 규칙을 이해했는가
- [ ] .ai/rules/REVIEW.md의 커밋 메시지 규칙을 확인했는가
- [ ] pnpm test 통과 확인
- [ ] pnpm lint 통과 확인
- [ ] pnpm type-check 통과 확인
```
