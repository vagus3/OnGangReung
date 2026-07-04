# Architecture Guide

<!-- 한국어 요약: 이 문서는 프로젝트 아키텍처 규칙을 정의합니다. AI가 참조하는 기준 문서이므로 영문으로 작성되었습니다. -->

> This document defines the initial architecture standards and principles for the project.
> Refer to this guide before starting a new feature or refactoring existing code.

---

## Table of Contents

<!-- 한국어 요약: 목차 -->

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Pattern: Feature-Sliced Design (FSD)](#2-pattern-feature-sliced-design-fsd)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Directory Details](#4-directory-details)
5. [Layer Dependency Rules](#5-layer-dependency-rules)
6. [Naming Conventions](#6-naming-conventions)
7. [State Management Strategy](#7-state-management-strategy)
8. [API Client Layer Design](#8-api-client-layer-design)
9. [Environment Variables](#9-environment-variables)
10. [AI Model Task Distribution](#10-ai-model-task-distribution)
11. [Code Review & PR Standards](#11-code-review--pr-standards)
12. [Maintenance Checklist](#12-maintenance-checklist)
13. [Infrastructure & Deployment](#13-infrastructure--deployment)

---

## 1. Architecture Philosophy

<!-- 한국어 요약: 아키텍처 철학 - 응집, 분리, 단방향 의존 등 핵심 설계 원칙 -->

### Core Principles

| Principle      | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| Cohesion       | Keep related code together. Group by feature/domain.           |
| Separation     | Separate code with different responsibilities.                 |
| Unidirectional | Dependency flows in one direction only.                        |
| Explicitness   | Avoid implicit global state and side effects.                  |
| Incremental    | Avoid over-engineering. Introduce complexity only when needed. |

### Decision Criteria

When introducing a new tool or pattern:

- What problem does this solve?
- Can a new developer understand this within 3 months?
- Does it make testing easier?

---

## 2. Pattern: Feature-Sliced Design (FSD)

<!-- 한국어 요약: 프론트엔드 FSD 패턴의 레이어 정의 및 슬라이스 내부 폴더 구조 규칙 -->

### Overview

Feature-Sliced Design (FSD) groups code by features to keep front-end code modular and scaleable.

```
app → views → widgets → features → entities → shared
```

Layers can only import from lower layers (Unidirectional dependency).

> NOTE: The FSD `pages` layer is renamed to `views` in this template.
> Next.js treats any `src/pages/` directory as a Pages Router root and tries to
> compile its files as routes, which breaks builds when `src/app/` (App Router)
> coexists. `views` keeps the same FSD role without the conflict.

### Layer Definitions

| Layer      | Responsibility                                       | Examples                                  |
| ---------- | ---------------------------------------------------- | ----------------------------------------- |
| `app`      | Entry point, providers, global routing               | `_app.tsx`, `layout.tsx`, `providers.tsx` |
| `views`    | Routes and page layouts (FSD `pages` layer)          | `DashboardPage`, `LoginPage`              |
| `widgets`  | Self-contained UI blocks combining multiple features | `Header`, `Sidebar`, `UserCard`           |
| `features` | User actions and business workflows                  | `auth`, `post-create`, `payment`          |
| `entities` | Business domain models and state                     | `user`, `product`, `order`                |
| `shared`   | Reusable UI, libraries, utilities, configs           | `ui`, `lib`, `api`, `config`              |

### Slice Internal Structure

Each slice (e.g., `features/auth`) must follow this segment structure:

```
features/auth/
├── ui/           # Component files for the feature
├── model/        # State and business logic (stores, hooks)
├── api/          # API call functions
├── lib/          # Helper utilities for the feature
└── index.ts      # Public API exports
```

> NOTE: Segment files should not be imported directly. Always export via `index.ts`.

### entities vs features Decision Rule

The key to reducing FSD boilerplate is using the `entities/` layer not just for type definitions, but as a central supplier of shared domain logic.

| Situation | Location |
|-----------|----------|
| 2+ features query the same domain data | `entities/[domain]/model/` |
| Only one feature uses the data | `features/[feature]/model/` |
| Pure types or constants with no logic | `entities/[domain]/` |

```typescript
// ✅ Shared hook in entities — reused across features
// entities/user/model/useUser.ts
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUser(userId),
  });
}

// features/profile/ui/ProfileCard.tsx   — consumes entities hook
// features/dashboard/ui/UserSummary.tsx — same hook, no duplication

// ✅ Feature-specific logic stays inside features
// features/post-create/model/usePostDraft.ts
```

> CAUTION: Do not force shared abstractions when each feature needs different query parameters. If a shared hook starts accumulating optional parameters, keep it feature-local instead.

---

## 3. Monorepo Structure

<!-- 한국어 요약: pnpm + Turborepo 기반의 모노레포 폴더 트리와 패키지 구성 규칙 -->

### Root Directory Layout

```
/
├── apps/
│   ├── web/          # Next.js web application
│   ├── mobile/       # React Native (bare) application (Optional)
│   └── api/          # Node.js backend (Express / NestJS)
│
├── packages/
│   ├── ui/           # Shared UI component library
│   ├── types/        # Shared TypeScript type definitions
│   ├── utils/        # Shared utility functions
│   ├── config/       # Shared configs (ESLint, TSConfig)
│   └── database/     # Prisma schema and migrations
│
├── .ai/              # AI config and rules
├── .github/          # CI/CD workflows
├── scripts/          # Workspace helper scripts
├── docs/             # Technical documentation
└── package.json      # Workspace root package.json
```

### Workspace Configuration

- Package Manager: `pnpm workspaces` (defined in `pnpm-workspace.yaml`, not `package.json`)
- Build Orchestration: `Turborepo`
- Internal Imports: Reference packages via `@project/ui`, `@project/types`.

### apps/web Structure (FSD Applied)

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   ├── views/            # FSD pages layer (renamed — see Section 2 NOTE)
│   ├── widgets/          # FSD widgets
│   ├── features/         # FSD features
│   ├── entities/         # FSD entities
│   └── shared/           # FSD shared
│       ├── ui/           # Shared components (Button, Input)
│       ├── api/          # API client setup
│       ├── config/       # Constants and environment settings
│       ├── lib/          # Third-party library wrappers
│       └── types/        # Web-specific types
├── public/
└── next.config.ts
```

### apps/api Structure (Clean Architecture Applied)

```
apps/api/
├── src/
│   ├── presentation/     # Controllers, routers, DTOs
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middlewares/
│   ├── application/      # Use cases and services
│   │   └── use-cases/
│   ├── domain/           # Entities, domain services, repository interfaces
│   │   ├── entities/
│   │   └── repositories/
│   └── infrastructure/   # Database, external services, cache
│       ├── database/
│       ├── repositories/
│       └── external/
├── tests/
└── tsconfig.json
```

---

## 4. Directory Details

<!-- 한국어 요약: 공유 컴포넌트(shared/ui), API(shared/api), 기능(features/*)의 세부 폴더 구조 -->

### shared/ui — Shared UI Components

```
shared/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Button.stories.tsx
│   └── index.ts
├── Input/
└── index.ts                 # Re-export all components
```

### shared/api — API Client Configuration

```
shared/api/
├── client.ts        # Client instance (axios/fetch)
├── token.ts         # Token storage module (features/auth syncs into it)
├── interceptors.ts  # Request and response interceptors
└── index.ts
```

### features/[feature-name] — Feature Slice

```
features/auth/
├── ui/
│   ├── LoginForm.tsx
│   └── LogoutButton.tsx
├── model/
│   ├── auth.store.ts     # Zustand store
│   └── auth.hooks.ts     # React Query hooks
├── api/
│   └── auth.api.ts       # API functions
└── index.ts              # Public API
```

---

## 5. Layer Dependency Rules

<!-- 한국어 요약: 프론트/백엔드 의존성 방향 규칙과 ESLint 설정 -->

### FSD Import Restrictions (Front-end)

```
Allowed Direction (Top → Bottom)
app       → views, widgets, features, entities, shared
views     → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
shared    → (External libraries only)

Disallowed Direction (Bottom → Top / Circular)
shared    → entities, features, widgets, views, app
entities  → features, widgets
features  → widgets, views

Cross-Slice Imports (Strictly Forbidden in same layer)
features/auth → features/payment  (Invalid)
entities/user → entities/product  (Invalid)
```

> NOTE: If code needs sharing in the same layer, extract it to a lower layer (e.g., `shared` or `entities`).

### Clean Architecture Import Restrictions (Back-end)

```
Allowed Direction
presentation  → application
application   → domain
infrastructure → domain

Disallowed Direction
domain        → application, presentation, infrastructure
application   → presentation, infrastructure
```

### ESLint Rules to Enforce Limits

```json
// .eslintrc.json
{
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          {
            "from": "app",
            "allow": ["views", "widgets", "features", "entities", "shared"]
          },
          {
            "from": "views",
            "allow": ["widgets", "features", "entities", "shared"]
          },
          { "from": "widgets", "allow": ["features", "entities", "shared"] },
          { "from": "features", "allow": ["entities", "shared"] },
          { "from": "entities", "allow": ["shared"] }
        ]
      }
    ]
  }
}
```

---

## 6. Naming Conventions

<!-- 한국어 요약: 파일, 폴더, 컴포넌트, 변수, 타입 등의 이름 짓기 규칙 -->

### Files & Directories

| Item       | Case Rule                       | Example           |
| ---------- | ------------------------------- | ----------------- |
| Components | PascalCase                      | `UserProfile.tsx` |
| Hooks      | camelCase with `use` prefix     | `useAuthStore.ts` |
| Utilities  | camelCase                       | `formatDate.ts`   |
| Constants  | camelCase or UPPER_SNAKE        | `apiEndpoints.ts` |
| Types      | camelCase                       | `auth.types.ts`   |
| Stores     | camelCase with `.store` suffix  | `auth.store.ts`   |
| APIs       | camelCase with `.api` suffix    | `user.api.ts`     |
| Tests      | Target file + `.test` / `.spec` | `Button.test.tsx` |
| Folders    | kebab-case                      | `user-profile/`   |

### Variables & Functions

```typescript
// Boolean flags: starts with is/has/can/should
const isLoading = true;
const hasPermission = false;
const canEdit = true;

// Event Handlers: starts with handle
const handleSubmit = () => {};
const handleInputChange = () => {};

// Async Functions: Verb + Noun
async function fetchUserProfile() {}
async function createOrder() {}

// Arrays: Plural noun
const users = [];
const productList = [];

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
```

### TypeScript Types

```typescript
// Type / Interface: PascalCase
type UserId = string;
interface UserProfile {}

// Component Props: Component name + Props
interface ButtonProps {}
interface UserCardProps {}

// API responses: Action + Response
interface GetUserResponse {}
interface CreateOrderResponse {}

// API request bodies: Action + Body
interface CreateOrderBody {}

// Enums: PascalCase with PascalCase keys
enum UserRole {
  Admin = "ADMIN",
  Member = "MEMBER",
}
```

---

## 7. State Management Strategy

<!-- 한국어 요약: 서버 상태와 클라이언트 상태 관리 규칙 및 Zustand/React Query 적용 원칙 -->

### State Management Tools

| State Category      | Tool                           | Description                                  |
| ------------------- | ------------------------------ | -------------------------------------------- |
| Server State        | `TanStack Query (React Query)` | Cache management, refetching, state handling |
| Global Client State | `Zustand`                      | Authentication tokens, themes, modals        |
| URL State           | `Next.js Router` / `nuqs`      | Search filters, page numbers, tabs           |
| Form State          | `React Hook Form`              | Input state, validations                     |
| Local UI State      | `useState` / `useReducer`      | Single component UI states                   |

### Key Rules

```typescript
// 1. Never copy Server State to Zustand stores
// Bad
const useUserStore = create((set) => ({
  user: null,
  fetchUser: async (id) => {
    const user = await getUser(id);
    set({ user }); // Server state copied to store (Forbidden)
  },
}));

// Good
export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId),
  });
}
```

```typescript
// 2. Put Zustand stores inside features/*/model/
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

### React Query Setup Standards

```typescript
// shared/api/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
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

## 8. API Client Layer Design

<!-- 한국어 요약: API 호출 계층 구조, Axios 클라이언트 설정 및 인터셉터, API 함수 양식 -->

### API Structure

```
UI Component → React Query Hook → API Call Function → Axios Instance
```

### Token Storage (framework-agnostic module in shared)

> CAUTION: `shared` must never import from `features` (see Section 5).
> The API client therefore reads the token from a plain module inside `shared`,
> and `features/auth` pushes token changes into it.

```typescript
// shared/api/token.ts
// Plain module, not a React store — keeps shared free of upward imports.
let accessToken: string | null = null;

export const tokenStorage = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
```

```typescript
// features/auth/model/auth.store.ts — syncs into shared/api/token.ts
import { tokenStorage } from "@/shared/api";

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  setToken: (token) => {
    tokenStorage.set(token); // keep shared module in sync
    set({ token });
  },
  clearAuth: () => {
    tokenStorage.clear();
    set({ token: null });
  },
}));
```

### Axios client with Token injection

```typescript
// shared/api/client.ts
import axios from "axios";
import { env } from "@/shared/config/env";
import { tokenStorage } from "./token";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: Inject bearer token automatically
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Redirect on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

### API Function Patterns

```typescript
// features/user/api/user.api.ts
import { apiClient } from "@/shared/api";
import type { UserProfile, UpdateUserBody } from "@/entities/user";

export const userApi = {
  getProfile: (userId: string) =>
    apiClient.get<UserProfile>(`/users/${userId}`).then((r) => r.data),

  updateProfile: (userId: string, body: UpdateUserBody) =>
    apiClient.patch<UserProfile>(`/users/${userId}`, body).then((r) => r.data),

  deleteAccount: (userId: string) => apiClient.delete(`/users/${userId}`),
};
```

---

## 9. Environment Variables

<!-- 한국어 요약: 환경변수 파일 구조, 프론트/백엔드 명명 규칙, Zod 검증 스키마 -->

### File Layout

```
.env               # Local development overrides (gitignored)
.env.example       # Example variable definitions (safe keys)
.env.development   # Development defaults
.env.staging       # Staging configuration
.env.production    # Production configuration
```

### Naming Conventions

```bash
# Public browser environment (Next.js)
NEXT_PUBLIC_API_URL=https://api.example.com

# Server environment only (No NEXT_PUBLIC prefix)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

### Zod Validation Schema for Safety

```typescript
// shared/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("MyApp"),
  NODE_ENV: z.enum(["development", "staging", "production"]),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NODE_ENV: process.env.NODE_ENV,
});
```

---

## 10. AI Model Task Distribution

<!-- 한국어 요약: Claude, Antigravity, Codex의 역할 정의 및 AI 협업 워크플로 -->

### Responsibilities

| AI Model    | Role                     | Ideal Work                                         |
| ----------- | ------------------------ | -------------------------------------------------- |
| Claude      | Architecture & Debugging | Complex refactoring, edge cases, core logic        |
| Antigravity | Codebase Analysis & Docs | Documentation, massive code review, translations   |
| Codex       | Boilerplate & Testing    | Component scaffolding, CRUD operations, test cases |

---

## 11. Code Review & PR Standards

<!-- 한국어 요약: PR 전 자가 체크리스트 및 머지 기준 -->

### Pre-PR Checklist

- [ ] No direct imports bypass `index.ts` public APIs
- [ ] No server state in Zustand stores
- [ ] No `any` types used
- [ ] No `console.log` statements left

---

## 12. Maintenance Checklist

<!-- 한국어 요약: 아키텍처 점검 및 새 기능 추가 시 프로세스 -->

### Add Feature Process

1. Define layer: Find correct location in FSD
2. Create slice: Add directory with `index.ts`
3. Declare types: Define types inside `entities/`
4. Create API: Define api endpoints in `features/*/api/`
5. Declare model: Setup queries or store values in `features/*/model/`
6. Implement UI: Build component inside `features/*/ui/`

---

## 13. Infrastructure & Deployment

<!-- 한국어 요약: CI/CD 및 K8s 네임스페이스 배포 요약 -->

### Deployment Flow

- Development: Automatic deploy on branch push
- Staging: Automatic deploy on merge to main
- Production: Manual approval trigger on tag release (`v*`)

Details: `.ai/rules/INFRA.md`

---

_Last Modified: 2026-07-04_
_Owner: shg-template architecture guide_
