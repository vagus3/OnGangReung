# Code Review & PR Rules

<!-- 한국어 요약: 이 문서는 AI/사람 리뷰어가 따라야 할 코드 리뷰 기준, 커밋 메시지 규칙, 브랜치 전략을 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> All AI reviewers must follow this document.

---

## Review Priority

1. Security
2. Runtime Error
3. Type Safety
4. Architecture
5. Performance
6. Maintainability
7. UI Consistency

---

## 1. Commit Message Rules

Conventional Commits, enforced by commitlint (`.husky/commit-msg`).

```
<type>: <subject>          # subject max 72 chars

feat: add user profile page
fix: prevent duplicate form submission
```

| Type       | Use for                                    |
| ---------- | ------------------------------------------ |
| `feat`     | New feature (not `feature`)                |
| `fix`      | Bug fix                                    |
| `refactor` | Code change without behavior change        |
| `style`    | Formatting only (no logic change)          |
| `docs`     | Documentation only                         |
| `test`     | Adding or fixing tests                     |
| `chore`    | Build process, dependencies, tooling       |
| `perf`     | Performance improvement                    |
| `ci`       | CI/CD configuration                        |
| `revert`   | Reverting a previous commit                |

> CAUTION: `feature:` is not a valid type and will be rejected by the commit hook. Use `feat:`.

---

## 2. Branch Strategy

| Branch       | Purpose                          | Deploy trigger                  |
| ------------ | -------------------------------- | ------------------------------- |
| `main`       | Integration branch               | Auto deploy to dev + staging    |
| `feature/**` | New features                     | CI checks only                  |
| `fix/**`     | Bug fixes                        | CI checks only                  |
| `v*` tags    | Production release               | Manual-approval production deploy |

All changes reach `main` through PRs. Direct pushes to `main` are discouraged.

---

## 3. Security Review

Check: exposed secrets, unsafe user input, authentication bypass, authorization problems.

Reject:

- API keys in source code
- Tokens stored insecurely
- Unsafe `eval` usage

---

## 4. Type Safety

TypeScript strict mode is required.

Reject:

- `any`
- `@ts-ignore`
- `unknown` without validation

```typescript
// Bad
const user: any = fetchUser();

// Good
interface User {
  id: string;
  name: string;
}
```

---

## 5. Architecture Review

Always check against `.ai/rules/ARCHITECTURE.md`.

Required: feature-based structure, small components, clear responsibility.

Reject:

- API call inside UI component
- Business logic inside JSX
- Duplicated logic
- Random folder creation outside FSD layers

---

## 6. React / Next Review

Prefer Server Components and small Client Components.

Reject:

- Unnecessary `"use client"`
- Unnecessary `useEffect`
- Duplicated state

---

## 7. Performance

| Area      | Check                       |
| --------- | --------------------------- |
| Images    | Optimized (`next/image`)    |
| Rendering | No unnecessary rerenders    |
| Bundle    | No oversized dependencies   |

---

## 8. UI Review

Always check against `.ai/rules/DESIGN.md`: spacing, color, typography, responsive behavior.

Reject: random Tailwind values, inconsistent components.

---

## 9. Testing Review

Required: important logic has tests, error cases handled.

Before approving, these must pass:

```bash
pnpm lint
pnpm test
pnpm build
```

---

## 10. Review Output Format

```markdown
## Summary

Short explanation.

## Problems

### Critical

Security / breaking issues

### Warning

Architecture / performance

### Suggestion

Code quality

## Final Decision

APPROVE or REQUEST_CHANGES
```

> CAUTION: Never approve dangerous code.

---

_Last Modified: 2026-07-04_
