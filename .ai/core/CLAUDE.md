# CLAUDE.md — AI Navigation Index

Read only the file mapped to the current task. Do not read all docs upfront.

---

## Task → File Routing

| Task type | Read this file |
|-----------|----------------|
| Folder structure, FSD layer decisions, naming, state management, API layer | `.ai/rules/ARCHITECTURE.md` |
| DB schema, Prisma models, migrations, repositories, indexing | `.ai/DATABASE.md` |
| Component design, tokens, typography, dark mode, a11y, breakpoints | `.ai/rules/DESIGN.md` |
| Writing or reviewing tests, mocking strategy, coverage targets | `.ai/rules/TEST.md` |
| PR rules, commit messages, branch strategy, review comment conventions | `.ai/rules/REVIEW.md` |
| Boilerplate scaffolding, CRUD generation, Codex prompt patterns | `.ai/CODEX.md` |
| Large-context analysis, doc generation, Antigravity prompt patterns | `.ai/ANTIGRAVITY.md` |
| Which AI model to pick, cost optimization | `.ai/core/MODEL_RULE.md` |
| Dashboard page layout template | `.ai/templates/DASHBOARD.md` |
| Landing page layout template | `.ai/templates/LANDING.md` |
| Mobile screen layout template | `.ai/templates/MOBILE.md` |
| Docker, Kubernetes, Helm, monitoring, logging, scaling, rollback | `.ai/rules/INFRA.md` |
| CI pipeline triggers, GitHub Actions jobs, deploy flow | `.github/workflows/deploy.yml` |

If the task spans two domains (e.g., "add a DB-backed feature"), read both mapped files.

---

## Always-Apply Rules (no file read needed)

### Architecture

- FSD import direction: `app → views → widgets → features → entities → shared`
  (`views` is the FSD `pages` layer, renamed to avoid Next.js Pages Router conflicts)
- Cross-slice imports within the same layer are forbidden
- Always import slices through their `index.ts`, never internal paths
- entities vs features: if 2+ features share the same domain data, put the React Query hook in `entities/[domain]/model/`. One feature only → keep in `features/[feature]/model/`

### Code Quality

- No `any` type usage
- Server state goes into React Query — never into Zustand stores
- All env vars accessed through `shared/config/env.ts`, never `process.env` directly in components

### Writing Rules (applies to all `.ai/` docs)

- No `**bold**` markers — use headers (`##`, `###`), inline code, or blockquotes instead
- Warnings written as `> NOTE:` or `> CAUTION:` blockquotes
- End each `.ai/` file with `_Last Modified: YYYY-MM-DD_`

---

## Model Selection Quick Reference

| Situation | Model |
|-----------|-------|
| Architecture decisions, complex debugging, type design | Claude |
| Whole-codebase analysis, doc generation, large context | Antigravity (`agy`) |
| Boilerplate, CRUD scaffolding, unit test generation | Codex |

Full rules: `.ai/core/MODEL_RULE.md`

---

_Last Modified: 2026-07-04_
