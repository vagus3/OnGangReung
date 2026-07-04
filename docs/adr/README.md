# Architecture Decision Records (ADR)

ADR은 프로젝트에서 내린 중요한 기술/설계 결정을 기록하는 문서입니다.
"왜 이 기술을 선택했는가"를 나중에 합류한 팀원이 이해할 수 있도록 남깁니다.

---

## ADR이란

소프트웨어 아키텍처에서 내린 의사결정을 시간 순으로 기록한 짧은 문서입니다.
결정의 배경(Context), 선택지(Options), 결정(Decision), 결과(Consequences)를 포함합니다.

규칙:

- 한 번 기록된 ADR은 수정하지 않습니다
- 결정을 번복할 경우 새 ADR을 작성하고 이전 ADR을 Superseded로 표시합니다
- 파일명 형식: `NNN-제목.md` (예: `001-monorepo-structure.md`)

---

## ADR 목록

| 번호                                    | 제목                                   | 상태              | 날짜       |
| --------------------------------------- | -------------------------------------- | ----------------- | ---------- |
| [001](./001-monorepo-and-fsd.md)        | 모노레포 + FSD 아키텍처 채택           | Accepted          | 2026-06-27 |
| [002](./002-state-management.md)        | 상태 관리 전략 (Zustand + React Query) | Accepted          | 2026-06-27 |
| [003](./003-ai-model-strategy.md)       | AI 멀티 모델 협업 전략                 | Superseded by 004 | 2026-06-27 |
| [004](./004-gemini-to-antigravity.md)   | Gemini CLI → Antigravity CLI 전환      | Accepted          | 2026-07-04 |

---

## ADR 작성 템플릿

새 ADR을 작성할 때 아래 템플릿을 사용하세요:

```markdown
# NNN. [결정 제목]

날짜: YYYY-MM-DD
상태: Proposed | Accepted | Deprecated | Superseded by [NNN]

## 배경 (Context)

이 결정이 필요하게 된 상황과 해결해야 할 문제를 설명합니다.

## 선택지 (Options)

검토한 대안들:

1. [옵션 A]
   - 장점: ...
   - 단점: ...

2. [옵션 B]
   - 장점: ...
   - 단점: ...

## 결정 (Decision)

[선택한 옵션]을 선택합니다.

이유: ...

## 결과 (Consequences)

이 결정으로 인한 영향:

- 긍정적: ...
- 부정적: ...
- 향후 고려사항: ...
```
