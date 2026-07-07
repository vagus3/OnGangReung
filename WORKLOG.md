# Worklog

커밋 단위 작업 이력. 최신 항목이 위에 옵니다.
기록 규칙: `.ai/core/CLAUDE.md` → Worklog 섹션 참고.

---

## 2026-07-07

### chore: effort 라우팅 서브에이전트 및 워크로그 규칙 구성

- `.claude/agents/`에 `effort-light`(haiku), `effort-standard`(sonnet) 서브에이전트 정의 추가
- 아키텍처·복잡한 디버깅·타입 설계 등 deep 티어 업무는 위임 없이 메인 세션이 직접 처리하도록 규칙화
- `.ai/core/MODEL_RULE.md`에 업무 유형 → effort 티어 분류표와 라우팅 규칙(Effort Routing) 섹션 추가
- 커밋마다 `WORKLOG.md`에 작업 요약을 같은 커밋으로 기록하는 Always-Apply 규칙을 `.ai/core/CLAUDE.md`에 추가
- 영향 파일: `.claude/agents/effort-light.md`, `.claude/agents/effort-standard.md`, `.ai/core/MODEL_RULE.md`, `.ai/core/CLAUDE.md`, `WORKLOG.md`
