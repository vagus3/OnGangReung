# Architecture Guide

> 이 문서는 프로젝트의 초기 구성 기준과 장기 유지보수를 위한 아키텍처 원칙을 정의합니다.
> 새 프로젝트를 시작하거나 기존 구조를 리팩터링할 때 반드시 이 문서를 먼저 참조하세요.

---

## 목차

1. [아키텍처 철학](#1-아키텍처-철학)
2. [채택 패턴: Feature-Sliced Design (FSD)](#2-채택-패턴-feature-sliced-design-fsd)
3. [모노레포 구조](#3-모노레포-구조)
4. [디렉터리 구조 상세](#4-디렉터리-구조-상세)
5. [레이어 간 의존성 규칙](#5-레이어-간-의존성-규칙)
6. [네이밍 컨벤션](#6-네이밍-컨벤션)
7. [상태 관리 전략](#7-상태-관리-전략)
8. [API 통신 레이어 설계](#8-api-통신-레이어-설계)
9. [환경변수 및 설정 관리](#9-환경변수-및-설정-관리)
10. [AI 모델별 역할 분담](#10-ai-모델별-역할-분담)
11. [코드 리뷰 / PR 기준](#11-코드-리뷰--pr-기준)
12. [유지보수 체크리스트](#12-유지보수-체크리스트)
13. [인프라 & 배포 구조](#13-인프라--배포-구조)

---

## 1. 아키텍처 철학

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| 응집(Cohesion) | 관련된 코드는 함께 위치한다. 기능 단위로 묶는다. |
| 분리(Separation) | 관심사가 다른 코드는 명확히 분리한다. |
| 단방향 의존(Unidirectional) | 의존성은 항상 한 방향으로만 흐른다. |
| 명시성(Explicitness) | 암묵적인 전역 상태나 사이드 이펙트를 최소화한다. |
| 점진적 도입(Incremental) | 과도한 추상화를 피한다. 필요할 때 복잡성을 도입한다. |

### 설계 결정의 기준

새로운 패턴이나 도구를 도입할 때 아래 질문에 답할 수 있어야 합니다:

- 이것이 없으면 무엇이 어려운가?
- 3개월 후 합류한 팀원이 이해할 수 있는가?
- 테스트하기 쉬운가?

---

## 2. 채택 패턴: Feature-Sliced Design (FSD)

### 개요

FSD(Feature-Sliced Design)는 기능 단위로 코드를 조직화하는 프론트엔드 아키텍처 방법론입니다.

```
app → pages → widgets → features → entities → shared
```

레이어는 위에서 아래 방향으로만 import 가능합니다.

### 레이어 정의

| 레이어 | 역할 | 예시 |
|--------|------|------|
| `app` | 앱 진입점, 전역 Provider, 라우팅 설정 | `_app.tsx`, `layout.tsx`, `providers.tsx` |
| `pages` | 라우트별 페이지 조합 | `DashboardPage`, `LoginPage` |
| `widgets` | 독립적인 UI 블록 (여러 feature 조합) | `Header`, `Sidebar`, `UserCard` |
| `features` | 사용자 시나리오 단위 기능 | `auth`, `post-create`, `payment` |
| `entities` | 비즈니스 도메인 모델 | `user`, `product`, `order` |
| `shared` | 재사용 가능한 범용 코드 | `ui`, `lib`, `api`, `config` |

### 슬라이스 내부 구조

각 레이어의 슬라이스(ex: `features/auth`)는 아래 세그먼트로 구성됩니다:

```
features/auth/
├── ui/           # 이 기능의 UI 컴포넌트
├── model/        # 상태, 비즈니스 로직 (store, hooks)
├── api/          # API 호출 함수
├── lib/          # 기능 전용 유틸
└── index.ts      # Public API (외부 노출 인터페이스만)
```

> 규칙: 슬라이스 내부 파일은 절대 직접 import하지 않습니다. 반드시 `index.ts`를 통해서만 접근합니다.

---

## 3. 모노레포 구조

### 루트 구조

```
/
├── apps/
│   ├── web/          # Next.js 프론트엔드
│   ├── mobile/       # React Native / Expo 앱 (선택)
│   └── api/          # Node.js 백엔드 (Express / Fastify / NestJS)
│
├── packages/
│   ├── ui/           # 공유 UI 컴포넌트 라이브러리
│   ├── types/        # 공유 TypeScript 타입
│   ├── utils/        # 공유 유틸리티 함수
│   ├── config/       # ESLint, TSConfig 등 공유 설정
│   └── database/     # Prisma 스키마, 마이그레이션
│
├── .ai/              # AI 협업 설정 및 규칙
├── .github/          # CI/CD 워크플로
├── scripts/          # 모노레포 관리 스크립트
├── docs/             # 프로젝트 문서
└── package.json      # 워크스페이스 루트
```

### 워크스페이스 도구

- 패키지 매니저: `pnpm workspaces` (권장) 또는 `npm workspaces`
- 빌드 오케스트레이션: `Turborepo`
- 공유 패키지 참조: `@project/ui`, `@project/types` 형태의 내부 패키지명 사용

### apps/web 내부 구조 (FSD 적용)

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router 또는 Pages Router
│   ├── pages/            # FSD pages 레이어
│   ├── widgets/          # FSD widgets 레이어
│   ├── features/         # FSD features 레이어
│   ├── entities/         # FSD entities 레이어
│   └── shared/           # FSD shared 레이어
│       ├── ui/           # 공통 UI 컴포넌트 (Button, Input 등)
│       ├── api/          # API 클라이언트 설정
│       ├── config/       # 앱 설정 (constants, env)
│       ├── lib/          # 외부 라이브러리 래퍼
│       └── types/        # 공유 타입 정의
├── public/
└── next.config.ts
```

### apps/api 내부 구조 (Clean Architecture 적용)

```
apps/api/
├── src/
│   ├── presentation/     # 컨트롤러, 라우터, DTO
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middlewares/
│   ├── application/      # 유스케이스, 서비스
│   │   └── use-cases/
│   ├── domain/           # 엔티티, 도메인 서비스, 인터페이스
│   │   ├── entities/
│   │   └── repositories/ # 인터페이스 정의
│   └── infrastructure/   # DB, 외부 API, 캐시
│       ├── database/
│       ├── repositories/ # 구현체
│       └── external/
├── tests/
└── tsconfig.json
```

---

## 4. 디렉터리 구조 상세

### shared/ui — 공통 컴포넌트

```
shared/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Button.stories.tsx   # Storybook (선택)
│   └── index.ts
├── Input/
└── index.ts                 # 모든 컴포넌트 re-export
```

### shared/api — API 클라이언트

```
shared/api/
├── client.ts        # axios / fetch 인스턴스 설정
├── interceptors.ts  # 요청/응답 인터셉터
└── index.ts
```

### features/[feature-name] — 기능 단위

```
features/auth/
├── ui/
│   ├── LoginForm.tsx
│   └── LogoutButton.tsx
├── model/
│   ├── auth.store.ts     # Zustand store
│   └── auth.hooks.ts     # React Query hooks
├── api/
│   └── auth.api.ts       # API 호출 함수
└── index.ts              # Public exports만
```

---

## 5. 레이어 간 의존성 규칙

### FSD Import 규칙 (프론트엔드)

```
✅ 허용된 방향 (위 → 아래)

app       → pages, widgets, features, entities, shared
pages     → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
shared    → (외부 라이브러리만)

❌ 금지된 방향 (아래 → 위)

shared    → entities, features, widgets, pages, app (절대 불가)
entities  → features, widgets (절대 불가)
features  → widgets, pages (절대 불가)

❌ 같은 레이어 내 슬라이스 간 import (절대 불가)

features/auth → features/payment  (불가)
entities/user → entities/product  (불가)
```

> 예외: 같은 레이어 간 공유가 필요하면 공통 코드를 하위 레이어(`shared` 또는 `entities`)로 내려야 합니다.

### 백엔드 Clean Architecture Import 규칙

```
✅ 허용된 방향

presentation  → application
application   → domain
infrastructure → domain

❌ 금지된 방향

domain        → application, presentation, infrastructure
application   → presentation, infrastructure
```

### ESLint로 강제하기

```json
// .eslintrc.json (eslint-plugin-boundaries 사용)
{
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          { "from": "app",      "allow": ["pages", "widgets", "features", "entities", "shared"] },
          { "from": "pages",    "allow": ["widgets", "features", "entities", "shared"] },
          { "from": "widgets",  "allow": ["features", "entities", "shared"] },
          { "from": "features", "allow": ["entities", "shared"] },
          { "from": "entities", "allow": ["shared"] }
        ]
      }
    ]
  }
}
```

---

## 6. 네이밍 컨벤션

### 파일 & 디렉터리

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `UserProfile.tsx` |
| 훅 파일 | camelCase, `use` 접두사 | `useAuthStore.ts` |
| 유틸 / 헬퍼 | camelCase | `formatDate.ts` |
| 상수 파일 | camelCase or UPPER_SNAKE | `apiEndpoints.ts` |
| 타입 파일 | camelCase | `auth.types.ts` |
| 스토어 파일 | camelCase, `.store` 접미사 | `auth.store.ts` |
| API 파일 | camelCase, `.api` 접미사 | `user.api.ts` |
| 테스트 파일 | 대상 파일명 + `.test` or `.spec` | `Button.test.tsx` |
| 디렉터리 | kebab-case | `user-profile/` |

### 컴포넌트 네이밍

```typescript
// ✅ 좋음: 역할이 명확한 이름
export function UserProfileCard() {}
export function AuthLoginForm() {}
export function DashboardStatWidget() {}

// ❌ 나쁨: 모호하거나 너무 짧은 이름
export function Card() {}
export function Form() {}
export function Component() {}
```

### 변수 & 함수

```typescript
// 불리언 변수: is/has/can/should 접두사
const isLoading = true;
const hasPermission = false;
const canEdit = true;

// 이벤트 핸들러: handle 접두사
const handleSubmit = () => {};
const handleInputChange = () => {};

// 비동기 함수: 동사 + 명사 (명확한 행위 표현)
async function fetchUserProfile() {}
async function createOrder() {}
async function updateUserSettings() {}

// 배열: 복수형
const users = [];
const productList = [];

// 상수: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
```

### TypeScript 타입 네이밍

```typescript
// 타입 / 인터페이스: PascalCase
type UserId = string;
interface UserProfile { ... }

// Props: 컴포넌트명 + Props
interface ButtonProps { ... }
interface UserCardProps { ... }

// API 응답: 동사 + Response
interface GetUserResponse { ... }
interface CreateOrderResponse { ... }

// API 요청 body: 동사 + Body
interface CreateOrderBody { ... }

// enum: PascalCase, 멤버는 PascalCase
enum UserRole {
  Admin = 'ADMIN',
  Member = 'MEMBER',
}
```

---

## 7. 상태 관리 전략

### 상태 유형별 도구 선택

| 상태 유형 | 권장 도구 | 설명 |
|-----------|-----------|------|
| 서버 상태 (원격 데이터) | `TanStack Query (React Query)` | 캐싱, 동기화, 로딩/에러 처리 |
| 전역 클라이언트 상태 | `Zustand` | 인증 정보, UI 테마, 전역 모달 등 |
| URL 상태 | `Next.js Router` / `nuqs` | 필터, 페이지네이션, 탭 상태 |
| 폼 상태 | `React Hook Form` | 폼 유효성 검사 및 제출 |
| 로컬 UI 상태 | `useState` / `useReducer` | 컴포넌트 내부 상태 |

### 상태 관리 규칙

```typescript
// ✅ 원칙 1: 서버 데이터는 React Query로, 절대 전역 스토어에 저장하지 않는다
// ❌ 나쁨
const useUserStore = create((set) => ({
  user: null,
  fetchUser: async (id) => {
    const user = await getUser(id);
    set({ user });  // 서버 데이터를 스토어에 저장 — 금지
  },
}));

// ✅ 좋음
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUser(userId),
  });
}
```

```typescript
// ✅ 원칙 2: Zustand store는 features/ 내의 model/ 에 위치한다
// features/auth/model/auth.store.ts
interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  clearAuth: () => set({ token: null }),
}));
```

```typescript
// ✅ 원칙 3: 상태는 최대한 아래에 위치한다 (State Colocation)
// 컴포넌트 내에서만 쓰이면 useState
// 여러 컴포넌트가 쓰이면 공통 조상으로 올리거나 Context
// 기능 전반에서 쓰이면 Zustand store
```

### React Query 설정 표준

```typescript
// shared/api/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5분
      gcTime: 1000 * 60 * 10,     // 10분
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## 8. API 통신 레이어 설계

### 구조 개요

```
UI 컴포넌트
    ↓
React Query Hook (features/*/model/*.hooks.ts)
    ↓
API 함수 (features/*/api/*.api.ts)
    ↓
HTTP 클라이언트 (shared/api/client.ts)
    ↓
백엔드 API
```

### HTTP 클라이언트 설정

```typescript
// shared/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 토큰 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 401 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API 함수 작성 규칙

```typescript
// features/user/api/user.api.ts
import { apiClient } from '@/shared/api';
import type { UserProfile, UpdateUserBody } from '@/entities/user';

// ✅ 각 API 함수는 단일 책임: 하나의 엔드포인트만 처리
export const userApi = {
  getProfile: (userId: string) =>
    apiClient.get<UserProfile>(`/users/${userId}`).then(r => r.data),

  updateProfile: (userId: string, body: UpdateUserBody) =>
    apiClient.patch<UserProfile>(`/users/${userId}`, body).then(r => r.data),

  deleteAccount: (userId: string) =>
    apiClient.delete(`/users/${userId}`),
};
```

### API 엔드포인트 관리

```typescript
// shared/config/apiEndpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
  },
} as const;
```

---

## 9. 환경변수 및 설정 관리

### 파일 구조

```
/
├── .env               # 로컬 개발 (gitignore 대상)
├── .env.example       # 환경변수 템플릿 (git 추적)
├── .env.development   # 개발 환경 기본값
├── .env.staging       # 스테이징 환경
└── .env.production    # 프로덕션 환경
```

### 네이밍 규칙

```bash
# 프론트엔드 (브라우저 노출 가능)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# 백엔드 전용 (절대 NEXT_PUBLIC 접두사 금지)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_URL=redis://...

# 공통
NODE_ENV=development
APP_ENV=staging   # development | staging | production
```

### 환경변수 타입 안전성

```typescript
// shared/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default('MyApp'),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

// 앱 시작 시 유효성 검사 — 실패 시 즉시 에러
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
});
```

### 설정 관리 규칙

- `process.env`를 컴포넌트에서 직접 사용하지 않습니다.
- 모든 환경변수는 `shared/config/env.ts`를 통해서만 접근합니다.
- `.env`는 절대 git에 커밋하지 않습니다.
- `.env.example`은 항상 최신 상태로 유지합니다.

---

## 10. AI 모델별 역할 분담

> `ai_config.json`에 정의된 모델 역할을 아키텍처 관점에서 구체화합니다.

### 모델별 적합 업무

| AI 모델 | 주요 용도 | 적합한 작업 예시 |
|---------|-----------|----------------|
| Claude | 아키텍처 설계, 복잡한 리팩터링, 디버깅 | 레이어 구조 설계, 복잡한 상태 로직 리팩터링, 타입 시스템 설계 |
| Gemini | 대용량 컨텍스트 분석, 문서화 | 전체 코드베이스 분석, API 문서 생성, 코드 리뷰 요약 |
| Codex | 보일러플레이트, 단순 CRUD, 테스트 | 컴포넌트 스캐폴딩, API 핸들러 생성, 단위 테스트 작성 |

### AI 협업 워크플로

```
1. 새 기능 설계
   └→ Claude: 아키텍처 결정, 레이어 분리 방식 논의

2. 코드 생성
   └→ Codex: 결정된 구조에 맞는 보일러플레이트 생성

3. 문서 / 리뷰
   └→ Gemini: 생성된 코드 전체 분석 및 문서화

4. 디버깅 / 최적화
   └→ Claude: 복잡한 버그 추적, 성능 최적화 전략
```

### AI에게 컨텍스트 제공 방법

```markdown
# AI 요청 시 포함할 정보

1. 현재 레이어 위치: "현재 features/auth/model 작업 중"
2. 의존성 방향: "shared/api 클라이언트를 사용할 것"
3. 기존 패턴: "useAuthStore 패턴을 참고"
4. 제약 조건: "서버 상태는 React Query로만 처리"
```

---

## 11. 코드 리뷰 / PR 기준

### PR 체크리스트

```markdown
## PR 제출 전 확인 사항

### 아키텍처
- [ ] FSD 레이어 규칙을 위반하지 않았는가?
- [ ] 슬라이스 내부 파일을 외부에서 직접 import하지 않았는가?
- [ ] 새 파일이 올바른 레이어에 위치하는가?

### 코드 품질
- [ ] 함수는 단일 책임을 가지는가?
- [ ] 네이밍 컨벤션을 따르는가?
- [ ] 타입을 명시적으로 정의했는가? (any 사용 금지)
- [ ] 불필요한 console.log를 제거했는가?

### 상태 관리
- [ ] 서버 데이터를 Zustand store에 저장하지 않았는가?
- [ ] 로컬 상태가 필요 이상으로 전역화되지 않았는가?

### 환경변수
- [ ] 새 환경변수를 .env.example에 추가했는가?
- [ ] 백엔드 전용 변수에 NEXT_PUBLIC 접두사를 붙이지 않았는가?

### 테스트
- [ ] 새 로직에 대한 단위 테스트가 있는가?
- [ ] 기존 테스트가 모두 통과하는가?
```

### 리뷰어 가이드

```markdown
## 리뷰 시 집중 포인트

### Must Fix (머지 불가)
- 레이어 의존성 방향 위반
- 보안 취약점 (민감 정보 노출, 인증 우회)
- 타입 안전성 파괴 (any 남용, 타입 단언 오남용)
- 환경변수 하드코딩

### Should Fix (강력 권고)
- 네이밍 컨벤션 미준수
- 서버 상태를 전역 스토어에 저장
- 에러 처리 누락
- 과도한 컴포넌트 크기 (200줄 초과 시 분리 검토)

### Nice to Have (선택)
- 성능 최적화 (메모이제이션, 코드 스플리팅)
- 접근성(a11y) 개선
- 스토리북 스토리 추가
```

### PR 크기 기준

| 크기 | 변경 줄 수 | 처리 방침 |
|------|-----------|----------|
| Small | ~200줄 | 당일 리뷰 권장 |
| Medium | 200~500줄 | 1일 이내 리뷰 |
| Large | 500줄 이상 | 분리 요청 권장 |

---

## 12. 유지보수 체크리스트

### 월간 점검

- [ ] 사용되지 않는 의존성 제거 (`depcheck`)
- [ ] 주요 패키지 보안 업데이트 확인 (`pnpm audit`)
- [ ] 사용되지 않는 환경변수 정리
- [ ] 레이어 의존성 규칙 위반 여부 확인

### 분기별 점검

- [ ] 아키텍처 결정 사항 문서 업데이트
- [ ] 패키지 메이저 버전 업그레이드 검토
- [ ] 성능 지표 측정 및 병목 분석
- [ ] FSD 레이어 구조 재검토 (비대해진 레이어 분리)

### 새 기능 추가 시 체크리스트

1. 레이어 결정: 어느 레이어에 위치할지 먼저 결정
2. 슬라이스 생성: `index.ts` (Public API)부터 작성
3. 타입 정의: 도메인 타입을 `entities/`에 먼저 정의
4. API 함수: `features/*/api/`에 API 호출 함수 작성
5. 상태 관리: React Query 또는 Zustand 선택 후 model 작성
6. UI 작성: 상태/로직이 준비된 후 UI 컴포넌트 작성
7. 테스트: 로직 단위 테스트 → UI 통합 테스트 순서

---

## 13. 인프라 & 배포 구조

> 상세 내용은 [INFRA.md](./INFRA.md) 참조.

### 전체 배포 흐름

```
개발자 Push
    ↓
GitHub Actions (CI)
    ├── Lint / Type-check / Test
    └── Docker 이미지 빌드 & 레지스트리 Push
            ↓
       Kubernetes (CD)
            ├── dev 네임스페이스   — 자동 배포
            ├── staging 네임스페이스 — PR 머지 시
            └── production 네임스페이스 — 태그 릴리즈
```

### 계층 구조 요약

| 계층 | 기술 | 역할 |
|------|------|------|
| 컨테이너화 | Docker (Multi-stage) | 앱 이미지 빌드, 환경 격리 |
| 오케스트레이션 | Kubernetes | 컨테이너 배포, 스케일링, 자가 치유 |
| 패키지 관리 | Helm | K8s 매니페스트 템플릿 & 환경별 값 관리 |
| CI/CD | GitHub Actions | 빌드 → 테스트 → 배포 자동화 |
| 모니터링 | Prometheus + Grafana | 메트릭 수집 & 시각화 |
| 로깅 | Loki + Promtail | 로그 집계 & 검색 |
| 인그레스 | Nginx Ingress Controller | L7 라우팅, TLS 종료 |

### 환경 분리 전략

```
dev       → 브랜치 push 시 자동 배포, 최소 리소스
stagong   → main 머지 시 자동 배포, 프로덕션 유사 설정
production → Git 태그(v*) 릴리즈 시 수동 승인 후 배포
```

---

*최종 수정: 2026-06-27*  
*담당: shg-template 아키텍처 가이드*
