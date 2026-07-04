# Database Guide

<!-- 한국어 요약: 이 문서는 Prisma ORM 및 PostgreSQL 스키마 설계, 마이그레이션 규칙을 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> This guide defines schema design, migration processes, and query patterns using Prisma ORM.
> We use PostgreSQL as the primary database, adhering to the 12-Factor App methodology.

---

## Table of Contents

<!-- 한국어 요약: 목차 -->

1. [Directory Layout](#1-directory-layout)
2. [Schema Design Rules](#2-schema-design-rules)
3. [Naming Conventions](#3-naming-conventions)
4. [Migration Strategy](#4-migration-strategy)
5. [Query Patterns](#5-query-patterns)
6. [Performance Optimization](#6-performance-optimization)
7. [Seeding Strategy](#7-seeding-strategy)
8. [Configuration by Environment](#8-configuration-by-environment)

---

## 1. Directory Layout

<!-- 한국어 요약: Prisma DB 패키지의 구조 -->

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Main Prisma schema
│   ├── migrations/            # Auto-generated SQL migration files
│   └── seed.ts                # Database seed script
├── src/
│   ├── client.ts              # Prisma Client singleton
│   ├── repositories/          # Repository queries
│   └── index.ts
```

---

## 2. Schema Design Rules

<!-- 한국어 요약: Prisma 스키마 모델 기본 설계 및 소프트삭제, 외래키 규칙 -->

### Basic Model Layout

All tables must contain timestamps (`createdAt`, `updatedAt`) and a nullable `deletedAt` for soft deletes.

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  role      UserRole  @default(MEMBER)
  posts     Post[]

  // Timestamps
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at") // Soft delete

  @@map("users") // Explicit snake_case plural table name
}

enum UserRole {
  ADMIN
  MEMBER
}
```

### Core Architecture Rules

- Primary Keys: Use `cuid()` as default string IDs. Avoid auto-increment integer IDs for public APIs to prevent security scans.
- Relations: Foreign keys should be placed on the N-side of 1:N relations. Use explicit junction tables for M:N relations.

---

## 3. Naming Conventions

<!-- 한국어 요약: 테이블/필드/Enum 명명 규칙 -->

| Scope       | Casing                | Example                   |
| ----------- | --------------------- | ------------------------- |
| Model       | PascalCase (Singular) | `User`, `Post`            |
| Field       | camelCase             | `createdAt`, `authorId`   |
| Table       | snake_case (Plural)   | `users`, `blog_posts`     |
| Columns     | snake_case            | `created_at`, `author_id` |
| Enum values | UPPER_SNAKE_CASE      | `ADMIN`, `SUPER_USER`     |

---

## 4. Migration Strategy

<!-- 한국어 요약: CLI 마이그레이션 적용 흐름과 무중단 마이그레이션 규칙 -->

### Command Lifecycle

```bash
# 1. Generate migrations during development
pnpm --filter database migrate dev --name init_schema

# 2. Deploy migrations to staging or production
pnpm --filter database migrate deploy
```

### Destructive Changes (Non-breaking updates)

Never rename or drop columns containing active production data. Follow these steps:

1. Create a new column with nullable properties.
2. Deploy code to write to both columns.
3. Migrate backfill data via script.
4. Update code to read from the new column.
5. Safely drop the old column in a later release.

---

## 5. Query Patterns

<!-- 한국어 요약: Prisma Client 싱글턴 및 리포지토리 패턴 작성 코드 예제 -->

### Prisma Client Singleton

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prevent multiple prisma clients in dev hot-reloads
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Repository Example

```typescript
import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

export const userRepository = {
  // Find single record, filtering out soft-deleted users
  findById: (id: string) =>
    prisma.user.findFirst({
      where: { id, deletedAt: null },
    }),

  // Paginated query with transactions
  findMany: async (page = 1, size = 20) => {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / size) };
  },
};
```

---

## 6. Performance Optimization

<!-- 한국어 요약: 인덱싱 가이드 및 슬로우 쿼리 감지 규칙 -->

- Create index models for fields frequently queried inside `where` or sorted via `orderBy`.
- Set slow query logs to trigger alerts if queries exceed 500ms in duration.

---

## 7. Seeding Strategy

<!-- 한국어 요약: DB 초기 세팅을 위한 시드 코드 예제 -->

Define a `prisma/seed.ts` script using `prisma.user.upsert` to guarantee idempotency on deployments.

---

## 8. Configuration by Environment

<!-- 한국어 요약: pgBouncer 및 커넥션 풀링 규칙 -->

- Dev: Direct TCP connection.
- Staging / Prod: Connect using PgBouncer with connection limit tuning. Append `?pgbouncer=true` parameter to connection strings.

---

_Last Modified: 2026-07-04_
