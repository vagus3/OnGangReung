# Testing Guide

> 좋은 테스트는 구현 세부사항이 아닌 동작(behavior) 을 검증합니다.
> Kent C. Dodds의 Testing Trophy 철학과 Testing Library 원칙을 기반으로 작성됐습니다.

---

## 목차

1. [테스트 철학](#1-테스트-철학)
2. [Testing Trophy — 레벨별 전략](#2-testing-trophy--레벨별-전략)
3. [도구 스택](#3-도구-스택)
4. [단위 테스트](#4-단위-테스트)
5. [통합 테스트](#5-통합-테스트)
6. [E2E 테스트](#6-e2e-테스트)
7. [테스트 파일 구조](#7-테스트-파일-구조)
8. [Mock & Stub 전략](#8-mock--stub-전략)
9. [테스트 커버리지 기준](#9-테스트-커버리지-기준)
10. [CI에서의 테스트](#10-ci에서의-테스트)

---

## 1. 테스트 철학

### 핵심 원칙

> "The more your tests resemble the way your software is used, the more confidence they can give you."
> — Kent C. Dodds

- 구현 세부사항을 테스트하지 않는다: 내부 state, 메서드 이름이 아닌 사용자가 보고 상호작용하는 것을 테스트
- 리팩터링에도 깨지지 않는 테스트: 코드 구조 변경 후에도 테스트가 통과해야 한다
- 테스트는 문서다: 테스트 코드를 읽으면 기능의 의도를 이해할 수 있어야 한다
- 테스트가 어렵다면 설계 문제: 테스트 불가한 코드는 결합도가 높다는 신호

### 안티패턴

```typescript
// ❌ 구현 세부사항 테스트 (리팩터링에 취약)
expect(component.state.isLoading).toBe(false);
expect(wrapper.find('Button').props().onClick).toBeDefined();

// ✅ 동작 테스트 (사용자 관점)
expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
expect(screen.getByRole('button', { name: '제출' })).toBeEnabled();
```

---

## 2. Testing Trophy — 레벨별 전략

```
          /‾‾‾‾‾‾‾‾‾‾‾\
         /   E2E (10%)  \        → Playwright (핵심 사용자 플로우)
        /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
       / Integration (60%) \     → Vitest + Testing Library
      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
     /    Unit (20%)        \    → Vitest (순수 함수, 유틸, hooks)
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
   /    Static (10%)          \  → TypeScript + ESLint
```

| 레벨 | 비중 | 속도 | 신뢰도 | 비용 |
|------|------|------|--------|------|
| Static | 10% | 즉시 | 낮음 | 매우 낮음 |
| Unit | 20% | 빠름 | 중간 | 낮음 |
| Integration | 60% | 중간 | 높음 | 중간 |
| E2E | 10% | 느림 | 매우 높음 | 높음 |

---

## 3. 도구 스택

| 역할 | 도구 | 용도 |
|------|------|------|
| 테스트 러너 | Vitest | 단위 + 통합 테스트 |
| 컴포넌트 테스트 | @testing-library/react | DOM 기반 컴포넌트 테스트 |
| E2E | Playwright | 브라우저 자동화 |
| API Mocking | MSW (Mock Service Worker) | 네트워크 요청 인터셉트 |
| 스냅샷 | Vitest 내장 | UI 회귀 감지 |
| 커버리지 | v8 (Vitest 내장) | 커버리지 리포트 |

### 설치

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event
pnpm add -D @testing-library/jest-dom msw
pnpm add -D playwright @playwright/test
```

### Vitest 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['/node_modules/', '/index.ts', '/*.stories.*'],
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 4. 단위 테스트

### 테스트 대상

- 순수 함수 (유틸리티, 헬퍼)
- 커스텀 훅 (비즈니스 로직)
- 복잡한 변환/계산 로직
- 엣지 케이스가 많은 함수

### 작성 패턴: AAA (Arrange-Act-Assert)

```typescript
// shared/lib/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    // Arrange
    const date = new Date('2026-06-27');

    // Act
    const result = formatDate(date);

    // Assert
    expect(result).toBe('2026-06-27');
  });

  it('Invalid Date 입력 시 빈 문자열을 반환한다', () => {
    const result = formatDate(new Date('invalid'));
    expect(result).toBe('');
  });

  it('null 입력 시 빈 문자열을 반환한다', () => {
    const result = formatDate(null);
    expect(result).toBe('');
  });
});
```

### 커스텀 훅 테스트

```typescript
// features/auth/model/useAuthStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null });
  });

  it('초기 상태는 token이 null이다', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.token).toBeNull();
  });

  it('setToken 호출 시 token이 업데이트된다', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setToken('test-token');
    });

    expect(result.current.token).toBe('test-token');
  });
});
```

---

## 5. 통합 테스트

### 테스트 대상

- 컴포넌트 + 상태 + API 통합 동작
- 사용자 인터랙션 플로우 (폼 제출, 네비게이션)
- 에러 상태 처리

### 핵심 원칙

```typescript
// ❌ 구현 세부사항 접근
const input = wrapper.find('input[name="email"]');

// ✅ 사용자 관점 접근 (Testing Library)
const input = screen.getByRole('textbox', { name: /이메일/i });
const button = screen.getByRole('button', { name: /로그인/i });
```

### 컴포넌트 통합 테스트 예시

```typescript
// features/auth/ui/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('LoginForm', () => {
  it('유효한 자격증명으로 로그인 성공 시 홈으로 이동한다', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();

    render(<LoginForm onSuccess={mockNavigate} />);

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('잘못된 자격증명 시 에러 메시지를 표시한다', async () => {
    server.use(
      http.post('/auth/login', () =>
        HttpResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
      )
    );

    const user = userEvent.setup();
    render(<LoginForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/이메일/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '이메일 또는 비밀번호가 올바르지 않습니다.'
      );
    });
  });

  it('로딩 중 버튼이 비활성화된다', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    expect(screen.getByRole('button', { name: /로그인/i })).toBeDisabled();
  });
});
```

---

## 6. E2E 테스트

### 테스트 대상 (핵심 플로우만)

- 회원가입 / 로그인 / 로그아웃
- 핵심 비즈니스 플로우 (결제, 주문 등)
- 크리티컬 경로

### Playwright 예시

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test('이메일 로그인 후 대시보드로 이동한다', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
  });

  test('로그아웃 후 로그인 페이지로 이동한다', async ({ page }) => {
    // 로그인 상태로 시작
    await page.goto('/dashboard');
    await page.getByRole('button', { name: '로그아웃' }).click();

    await expect(page).toHaveURL('/login');
  });
});
```

---

## 7. 테스트 파일 구조

### 파일 위치 규칙

```
features/auth/
├── ui/
│   ├── LoginForm.tsx
│   └── LoginForm.test.tsx   ← 컴포넌트와 같은 폴더
├── model/
│   ├── auth.store.ts
│   └── auth.store.test.ts   ← 로직 파일과 같은 폴더
└── api/
    ├── auth.api.ts
    └── auth.api.test.ts

e2e/                         ← E2E는 루트에 별도 폴더
├── auth.spec.ts
└── dashboard.spec.ts
```

### 테스트 설명 작성 규칙

```typescript
describe('[모듈/컴포넌트 이름]', () => {
  describe('[상태/시나리오 그룹]', () => {
    it('[사용자 관점의 동작 설명]', () => { ... });
  });
});

// 예시
describe('LoginForm', () => {
  describe('성공 케이스', () => {
    it('올바른 이메일과 비밀번호 입력 후 로그인 버튼 클릭 시 대시보드로 이동한다', () => {});
  });

  describe('실패 케이스', () => {
    it('잘못된 비밀번호 입력 시 에러 메시지를 표시한다', () => {});
    it('이메일 형식이 잘못됐을 때 폼 유효성 에러를 표시한다', () => {});
  });

  describe('로딩 상태', () => {
    it('제출 중 로딩 스피너를 표시하고 버튼을 비활성화한다', () => {});
  });
});
```

---

## 8. Mock & Stub 전략

### MSW로 API Mocking

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test User',
      email: 'test@example.com',
    });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.password === 'wrong') {
      return HttpResponse.json(
        { message: '인증 실패' },
        { status: 401 }
      );
    }

    return HttpResponse.json({ token: 'mock-jwt-token' });
  }),
];
```

### Mock 사용 원칙

```typescript
// ✅ 외부 의존성만 mock (네트워크, 시간, 파일시스템)
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

// ❌ 내부 로직을 mock하지 않는다
vi.mock('./useAuthStore');  // 이렇게 하면 테스트 의미가 없음

// ✅ 테스트 데이터는 별도 파일로 관리
// src/test/fixtures/user.fixture.ts
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};
```

---

## 9. 테스트 커버리지 기준

### 최소 커버리지 목표

| 레이어 | 목표 |
|--------|------|
| `shared/lib` (유틸) | 90% |
| `features/*/model` (비즈니스 로직) | 80% |
| `features/*/api` (API 함수) | 70% |
| `features/*/ui` (컴포넌트) | 60% |
| `pages` | 50% |

> 커버리지 수치보다 테스트 품질이 중요합니다.
> 100%를 달성하기 위해 의미 없는 테스트를 추가하지 마세요.

### 커버리지 제외 대상

```typescript
// vitest.config.ts
coverage: {
  exclude: [
    '/node_modules/',
    '/index.ts',           // re-export 파일
    '/*.stories.*',        // Storybook
    '/*.types.ts',         // 타입 정의
    '/test/',            // 테스트 파일
    '/__mocks__/',       // Mock 파일
  ],
}
```

---

## 10. CI에서의 테스트

### GitHub Actions 파이프라인

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile

      # 정적 분석
      - run: pnpm type-check
      - run: pnpm lint

      # 단위 + 통합 테스트
      - run: pnpm test --coverage

      # E2E (PR에서만)
      - if: github.event_name == 'pull_request'
        run: pnpm test:e2e
```

### 테스트 실행 명령어

```bash
# 단위 + 통합 테스트
pnpm test

# 감시 모드 (개발 중)
pnpm test --watch

# 커버리지 포함
pnpm test --coverage

# E2E
pnpm test:e2e

# E2E UI 모드
pnpm test:e2e --ui
```

---

*최종 수정: 2026-06-27*
