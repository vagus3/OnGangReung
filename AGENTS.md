# SHG Template — Agent Context

> Read by Codex (`codex`) and Antigravity CLI (`agy`). Claude Code uses the root `CLAUDE.md`.

Before any task, read `.ai/core/CLAUDE.md` first. It maps each task type to the
single rule file you need (architecture, database, design, tests, review, infra).
Do not read all `.ai/` docs upfront.

## Always-Apply Rules

Full list in `.ai/core/CLAUDE.md`. The critical ones:

- FSD import direction: `app → views → widgets → features → entities → shared`
  (`views` is the FSD `pages` layer, renamed to avoid Next.js Pages Router conflicts)
- Cross-slice imports within the same layer are forbidden; import slices via `index.ts` only
- No `any` type usage
- Server state goes into React Query — never into Zustand stores
- Env vars only through `shared/config/env.ts`, never `process.env` in components
- No `**bold**` markers in `.ai/` docs; end each `.ai/` file with `_Last Modified: YYYY-MM-DD_`

## Model Roles

| Tool               | Use for                                             |
| ------------------ | --------------------------------------------------- |
| Claude             | Architecture, complex refactoring, debugging        |
| Antigravity (`agy`) | Whole-codebase analysis, documentation             |
| Codex              | Boilerplate, CRUD scaffolding, unit test generation |

_Last Modified: 2026-07-04_
