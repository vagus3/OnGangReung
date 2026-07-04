# Antigravity Usage Guide

<!-- 한국어 요약: 이 문서는 대용량 분석 및 문서화 전용 AI 도구인 Antigravity CLI(Gemini 3 기반)의 역할과 대규모 컨텍스트 프롬프트 예제를 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> Antigravity CLI (`agy`) is Google's agent-first CLI powered by Gemini 3.
> It replaced Gemini CLI, which stopped serving requests on 2026-06-18.
> Best for large-context processing, documentation audits, and low-cost mock data creation.

---

## Tool Notes

- Command: `agy` (install from antigravity.google/download)
- Context files: reads `AGENTS.md` and `.antigravity.md` from the project root (`GEMINI.md` is still supported for backward compatibility)
- This repo wires project rules through the root `AGENTS.md`, which routes to `.ai/core/CLAUDE.md`
- Background multi-agent orchestration is available; prefer it for long-running whole-repo audits

---

## Responsibilities

Antigravity is preferred for the following tasks:

| Task                       | Examples                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Massive Context Audits     | Structural reviews of the whole repo, identifying code duplication across apps |
| Documentation Automation   | Generating API specifications, formatting JSDocs, updating README files        |
| Pull Request Summaries     | Summarizing changelogs of large feature merges                                 |
| Translation & Localization | Localizing i18n key maps, translation updates                                  |
| Comparative Analysis       | Evaluating libraries, comparing SDK versions                                   |

---

## Leveraging Large Context

Use Antigravity's massive token capacity by feeding multiple files simultaneously.

### Sample Codebase Audit Prompt

```markdown
# Repository Audit Request

Analyze the following files to identify cross-slice FSD import violations:

## [apps/web/src/features/auth/ui/LoginForm.tsx]

[Paste Content]

## [apps/web/src/shared/api/client.ts]

[Paste Content]

# Request

1. Identify any imports violating unidirectional dependency rules.
2. Highlight duplicate utils.
```

---

## When to Avoid Antigravity

| Use Case                            | Better Alternative |
| ----------------------------------- | ------------------ |
| High-level architecture decisions   | Claude             |
| Complex debugging (race conditions) | Claude             |
| Complex generic type system design  | Claude             |
| Scaffold CRUD files                 | Codex              |

---

## Cost-Effective Guidelines

Antigravity excels at high-volume, low-cost processing:

```
High-Cost / High-Reasoning (Use Claude)
└── Architecture design, debugging core packages

Mid-Cost / High-Volume (Use Antigravity)
└── Codebase reviews, documentation generator

Low-Cost / High-Speed (Use Codex)
└── Repetitive tests, CRUD methods
```

---

_Last Modified: 2026-07-04_
_Tied to: ai_config.json configuration_
