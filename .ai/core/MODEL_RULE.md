# Model & Writing Rules

<!-- 한국어 요약: 이 문서는 AI 협업 문서 작성 시 **(볼드) 강조 기호 사용 금지 규칙과 비용 최적화 원칙을 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> This guide defines writing standards for AI-assisted documentation.
> Applies to all files in the `.ai/` directory and context prompts sent to AI.

---

## Documentation Rules

### No Bold Markdown Annotations

Do not use `**` (bold) markdown annotations in codes, comments, or documentation files.

Reasons:

- The `**` markers act as syntactic noise when processed by LLMs in raw contexts.
- Over-highlighting single words degrades the logical hierarchy of the document.
- Use section headers (##, ###), inline code wrappers (`), or blockquotes (>) instead.

```markdown
# Bad

This function **must** be a pure function.
| **Component** | **Role** |

# Good

This function must be a pure function.
| Component | Role |
Refer to `pure function` rules.
```

### Alternatives for Emphasis

| Goal                        | Alternative                                 |
| --------------------------- | ------------------------------------------- |
| Highlight important concept | Separate with header section (##, ###)      |
| Commands or code tokens     | Use inline code wrapper (`)                 |
| Strict constraints          | Use blockquotes (>)                         |
| Warnings or notices         | Use prefix alerts: `> NOTE:` / `> CAUTION:` |

---

## AI Model Selection Rules

<!-- 한국어 요약: 컨텍스트 크기별 AI 모델 매핑 및 비용 최적화 전략 -->

Follow these selection guides on top of `ai_config.json`:

### Context Size Limits

| Context Scale                  | Target Model     |
| ------------------------------ | ---------------- |
| Single file to few files       | Claude (Default) |
| Whole codebase analysis        | Antigravity      |
| Boilerplate / Repetitive tasks | Codex            |

> NOTE: Antigravity CLI (`agy`, Gemini 3) replaced Gemini CLI, which was sunset on 2026-06-18.

### Cost Optimization

- Delegate architecture design to Claude → Hand over boilerplate implementation to Codex.
- Do not repeat identical complex prompts to Claude. Use Antigravity for documentation and summaries.

---

## Effort Routing (Claude Code Subagents)

<!-- 한국어 요약: Claude Code 세션에서 지시받은 업무 유형에 따라 effort 티어를 분류하고, light/standard는 서브에이전트로 위임, deep은 메인 세션이 직접 처리합니다. -->

When a task is given in a Claude Code session, classify it into a tier first,
then route to the matching executor. Agent definitions live in
`.claude/agents/effort-*.md`.

### Tier Table

| Tier     | Executor                          | Task types                                                                  |
| -------- | --------------------------------- | --------------------------------------------------------------------------- |
| light    | `effort-light` subagent (haiku)   | Boilerplate, repetitive edits, renames, doc formatting, obvious one-liners  |
| standard | `effort-standard` subagent (sonnet) | Feature work from a clear spec, unit tests, refactoring, CRUD wiring      |
| deep     | Main session (no delegation)      | Architecture decisions, complex debugging, type design, ambiguous scope    |

### Routing Rules

- Default to the lowest tier that can finish the task without making design
  decisions. When in doubt between two tiers, pick the higher one.
- Escalate, never downgrade: if a delegated agent reports ambiguity or a
  blocker, the main session takes the task over directly.
- Mixed tasks are split: the main session does the design part (deep), then
  delegates the resulting scaffolding or repetitive part (light/standard) with
  the decisions spelled out in the delegation prompt.
- Delegation prompts must be self-contained: include the exact files, the
  decided approach, and the relevant `.ai/` doc to read.

> NOTE: deep tasks are intentionally not delegated. The main session already
> runs on the highest-capability model, and delegation would only lose
> conversation context.

---

## Maintenance Rules

- Keep a "Last Modified: YYYY-MM-DD" stamp at the end of each `.ai/` file.
- Update related documentation side-by-side with source code changes.

---

_Last Modified: 2026-07-07_
