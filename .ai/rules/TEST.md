# Testing Guide

<!-- 한국어 요약: 이 문서는 테스트 피라미드/트로피 및 테스트 작성 규칙을 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> Good tests verify behavior rather than implementation details.
> Based on Kent C. Dodds' Testing Trophy model and the Testing Library principles.

---

## Table of Contents

<!-- 한국어 요약: 목차 -->

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Trophy — Strategy](#2-testing-trophy--strategy)
3. [Tooling Stack](#3-tooling-stack)
4. [Unit Tests](#4-unit-tests)
5. [Integration Tests](#5-integration-tests)
6. [E2E Tests](#6-e2e-tests)
7. [Test Directory Layout](#7-test-directory-layout)
8. [Mocking Strategy](#8-mocking-strategy)
9. [Target Coverage Goals](#9-target-coverage-goals)
10. [Backend Testing — pytest](#10-backend-testing--pytest)

---

## 1. Testing Philosophy

<!-- 한국어 요약: 구현 상세를 테스트하는 안티패턴 방지 및 사용자 관점 검증 원칙 -->

- Do not test implementation details: Focus on what the user experiences, not local state or internal method names.
- Resilient to Refactoring: Moving modules should not break test assertions if behavior remains identical.

```typescript
// Bad: Testing implementation details (fragile)
expect(component.state.isLoading).toBe(false);

// Good: Testing behavior (robust)
expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
```

---

## 2. Testing Trophy — Strategy

<!-- 한국어 요약: Static, Unit, Integration, E2E 테스트 비중과 분담 -->

- Static (10%): TypeScript + ESLint.
- Unit (20%): Pure functions, helpers, custom hook logic.
- Integration (60%): Components, forms, API flows using Vitest + React Testing Library.
- E2E (10%): Key user paths using Playwright.

---

## 3. Tooling Stack

<!-- 한국어 요약: Vitest, React Testing Library, MSW 등 테스트 도구 구성 -->

- Test Runner (web): Vitest.
- DOM Testing: `@testing-library/react`.
- API Mocking: MSW (Mock Service Worker).
- E2E: Playwright.
- Test Runner (api): pytest + pytest-asyncio + httpx (see Section 10).

---

## 4. Unit Tests

<!-- 한국어 요약: AAA 패턴 및 커스텀 훅 테스트 예제 -->

### AAA Pattern (Arrange-Act-Assert)

```typescript
describe("formatDate", () => {
  it("should return date formatted as YYYY-MM-DD", () => {
    // Arrange
    const date = new Date("2026-06-27");
    // Act
    const result = formatDate(date);
    // Assert
    expect(result).toBe("2026-06-27");
  });
});
```

---

## 5. Integration Tests

<!-- 한국어 요약: MSW를 사용한 API 모킹 컴포넌트 통합 테스트 예제 -->

Mocking APIs using MSW inside component tests rather than mocking internal helper logic.

```typescript
describe('LoginForm', () => {
  it('should navigate to dashboard upon successful login', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();

    render(<LoginForm onSuccess={mockNavigate} />);

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

---

## 6. E2E Tests

<!-- 한국어 요약: Playwright E2E 테스트 예제 -->

Target major user journeys.

```typescript
test("should perform full login sequence", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/dashboard");
});
```

---

## 7. Test Directory Layout

<!-- 한국어 요약: 테스트 파일 명명 및 코드 근처 배치 규칙 -->

Keep test files next to implementation code:

```
features/auth/
├── ui/
│   ├── LoginForm.tsx
│   └── LoginForm.test.tsx
```

---

## 8. Mocking Strategy

<!-- 한국어 요약: 모킹 모범 사례 및 MSW 핸들러 예제 -->

- Mock external APIs/Network using MSW.
- Do not mock local hooks/components under test (Mock inputs, assert outputs).

---

## 9. Target Coverage Goals

<!-- 한국어 요약: 레이어별 권장 테스트 커버리지 목표 -->

- shared/lib: 90%+
- features/\*/model: 80%+
- features/\*/ui: 60%+
- app/services (api): 80%+

---

## 10. Backend Testing — pytest

<!-- 한국어 요약: FastAPI 라우터 테스트 패턴 — httpx AsyncClient + SQLite 인메모리 -->

Test through the HTTP boundary (router level), not by calling services
directly — same philosophy as Testing Library: verify behavior, not
implementation.

### Fixture Pattern

The `client` fixture (tests/conftest.py) boots the real FastAPI app with the
DB dependency overridden to in-memory SQLite. Tests need no external services:

```python
async def test_create_and_list_posts(client: AsyncClient) -> None:
    res = await client.post("/api/v1/posts", json={"title": "hello", "content": "world"})
    assert res.status_code == 201

    res = await client.get("/api/v1/posts")
    assert res.status_code == 200
    assert len(res.json()) == 1
```

### Rules

- Async mode is automatic (`asyncio_mode = "auto"` in pyproject.toml) —
  plain `async def test_*` functions, no decorators needed.
- Assert on status codes and response bodies, including error shapes
  (`{"detail": ..., "code": ...}`).
- Validation failures are covered by schema tests (422 assertions), not by
  re-testing Pydantic itself.
- Run: `pnpm --filter api test` or `cd apps/api && uv run pytest`.

---

_Last Modified: 2026-07-05_
