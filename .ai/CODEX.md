# Codex Usage Guide

<!-- 한국어 요약: 이 문서는 CRUD 및 테스트 생성 등 반복 작업용 AI 모델인 Codex의 스캐폴딩 프롬프트 예제를 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> Codex is optimized for boilerplate generation and predictable CRUD operations.
> Works by generating files under the architectural directions decided by Claude.

---

## Responsibilities

Codex is preferred for the following tasks:

| Task                        | Examples                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| Boilerplate Scaffolding | Setting up empty FSD slice trees (api, ui, model, index.ts)      |
| Simple CRUD             | Generating database repositories, CRUD controller endpoints      |
| Unit Test Generation    | Creating AAA (Arrange-Act-Assert) test suites for pure functions |
| Type Conversions        | Mapping JSON payloads into TypeScript interfaces                 |
| Config Setup            | Scaffolding basic setups (tsconfig, eslint rules, compose specs) |

---

## Effective Prompting Guide

### Leverage Coding Patterns

Provide existing code as a pattern reference to guarantee consistent code styles.

```
# Codex Scaffold Request

Reference Pattern: [Path to an existing feature slice, e.g., features/auth]

Please generate the following files for the `features/product` slice matching the reference pattern above:
- Entity Name: Product
- Fields: id, name, price, stock, description
- Target Files: product.api.ts, product.store.ts, product.hooks.ts, index.ts
```

### Unit Test Generation Prompt

```
# Generate unit tests for the following currency parser utility

Reference Pattern: formatDate.test.ts (attached)

File to Test: shared/lib/formatCurrency.ts
[Paste File Content]

Requirements:
- Use Vitest and AAA structure (Arrange-Act-Assert)
- Include edge cases (negative numbers, zero, invalid inputs)
```

---

## When to Avoid Codex

| Use Case                              | Better Alternative |
| ------------------------------------- | ------------------ |
| Defining module decoupling strategies | Claude             |
| Complex async logic / race conditions | Claude             |
| Auditing full repository context      | Antigravity        |

---

## Code Generation Checklist

Always verify Codex outputs against these checks:

- [ ] No imports bypass FSD `index.ts` public APIs
- [ ] No server state stored inside Zustand stores
- [ ] No `any` type definitions used
- [ ] Proper error catches are implemented

---

_Last Modified: 2026-07-04_
_Tied to: ai_config.json configuration_
