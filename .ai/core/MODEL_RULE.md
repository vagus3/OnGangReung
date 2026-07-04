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

## Maintenance Rules

- Keep a "Last Modified: YYYY-MM-DD" stamp at the end of each `.ai/` file.
- Update related documentation side-by-side with source code changes.

---

_Last Modified: 2026-07-04_
