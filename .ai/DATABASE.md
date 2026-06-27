# Database Guide

Prisma ORM 기반 데이터베이스 설계 및 유지보수 가이드입니다.
PostgreSQL을 기본 DB로 사용하며, 12-Factor App의 데이터베이스 원칙을 따릅니다.

---

## 목차

1. [디렉터리 구조](#1-디렉터리-구조)
2. [스키마 설계 원칙](#2-스키마-설계-원칙)
3. [네이밍 컨벤션](#3-네이밍-컨벤션)
4. [마이그레이션 전략](#4-마이그레이션-전략)
5. [쿼리 패턴](#5-쿼리-패턴)
6. [성능 최적화](#6-성능-최적화)
7. [시드(Seed) 데이터](#7-시드seed-데이터)
8. [환경별 DB 설정](#8-환경별-db-설정)
9. [DB 유지보수 체크리스트](#9-db-유지보수-체크리스트)

---

## 1. 디렉터리 구조

```
packages/database/
├── prisma/
│   ├── schema.prisma          # 메인 스키마 정의
│   ├── migrations/            # 자동 생성 마이그레이션 파일
│   │   └── 20260627_init/
│   │       └── migration.sql
│   └── seed.ts                # 초기 데이터 시드
├── src/
│   ├── client.ts              # Prisma Client 싱글턴
│   ├── repositories/          # 도메인별 쿼리 함수
│   │   ├── user.repository.ts
│   │   └── post.repository.ts
│   └── index.ts
└── package.json
```

---

## 2. 스키마 설계 원칙

### 기본 모델 구조

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 공통 타임스탬프 믹스인 (모든 모델에 포함)
// Prisma는 믹스인을 지원하지 않으므로 각 모델에 직접 추가

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(MEMBER)

  // 관계
  posts     Post[]
  sessions  Session[]

  // 타임스탬프 (모든 모델에 필수)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?  // 소프트 삭제

  @@map("users")  // 테이블명은 snake_case 복수형
}

enum UserRole {
  ADMIN
  MANAGER
  MEMBER
}

model Post {
  id        String  @id @default(cuid())
  title     String
  content   String  @db.Text
  published Boolean @default(false)

  authorId  String
  author    User   @relation(fields: [authorId], references: [id])

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([authorId])
  @@index([createdAt(sort: Desc)])
  @@map("posts")
}
```

### 설계 원칙

```
ID 전략:
- 기본: cuid() — URL 안전, 정렬 가능, 충돌 없음
- 노출 API ID: nanoid() (짧은 URL용)
- 절대 사용 금지: auto-increment Int (예측 가능 → 보안 취약)

소프트 삭제:
- deletedAt DateTime? 필드를 모든 엔티티에 추가
- 실제 삭제 대신 deletedAt 타임스탬프 설정
- 조회 시 항상 deletedAt: null 조건 포함

관계 설계:
- 1:N 관계에서 외래키는 N 쪽에 위치
- M:N 관계는 명시적 조인 테이블 사용 (암시적 @relation 지양)
- 순환 참조는 optional 필드로 처리
```

---

## 3. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 모델명 | PascalCase 단수 | `User`, `BlogPost` |
| 필드명 | camelCase | `createdAt`, `authorId` |
| 테이블명(@@map) | snake_case 복수 | `users`, `blog_posts` |
| 컬럼명(@map) | snake_case | `created_at`, `author_id` |
| Enum 타입 | PascalCase | `UserRole` |
| Enum 값 | UPPER_SNAKE_CASE | `ADMIN`, `SUPER_ADMIN` |
| 인덱스 | 자동 생성 또는 명시적 이름 | `@@index([email])` |

```prisma
// 컬럼명 매핑 예시 (Prisma 필드는 camelCase, DB 컬럼은 snake_case)
model Post {
  authorId String @map("author_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("posts")
}
```

---

## 4. 마이그레이션 전략

### 기본 흐름

```bash
# 1. 스키마 수정 후 마이그레이션 생성 (개발)
pnpm --filter database migrate dev --name add_user_avatar

# 2. 마이그레이션 확인 (생성된 SQL 검토)
cat packages/database/prisma/migrations/[timestamp]_add_user_avatar/migration.sql

# 3. 스테이징/프로덕션에 마이그레이션 적용
pnpm --filter database migrate deploy

# 4. 현재 마이그레이션 상태 확인
pnpm --filter database migrate status
```

### 위험한 마이그레이션 처리

컬럼 삭제 / 이름 변경 / 타입 변경 시 데이터 유실 위험이 있습니다.

```bash
# 1단계: 새 컬럼 추가 (nullable)
# 2단계: 코드 배포 (새 컬럼 사용)
# 3단계: 데이터 마이그레이션 (기존 데이터 복사)
# 4단계: 기존 컬럼 삭제 (안전 확인 후)

# 예: email_old → email 이름 변경
# ❌ 한 번에 변경 (데이터 유실)
# ✅ 단계별 진행

-- migration_step1.sql
ALTER TABLE users ADD COLUMN email_new VARCHAR(255);

-- 코드 배포 후

-- migration_step2.sql (데이터 복사)
UPDATE users SET email_new = email_old;
ALTER TABLE users ALTER COLUMN email_new SET NOT NULL;

-- 코드 배포 후

-- migration_step3.sql (기존 컬럼 삭제)
ALTER TABLE users DROP COLUMN email_old;
```

### 마이그레이션 규칙

```
- 마이그레이션 파일은 절대 수정하지 않는다 (배포 후)
- 새 마이그레이션으로 수정한다
- 마이그레이션 파일은 git에서 추적한다
- PR 시 마이그레이션 SQL을 반드시 리뷰한다
- 프로덕션 마이그레이션은 트래픽이 낮은 시간대에 적용
```

---

## 5. 쿼리 패턴

### Prisma Client 싱글턴

```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// 개발 환경에서 핫 리로드 시 중복 인스턴스 방지
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Repository 패턴

```typescript
// packages/database/src/repositories/user.repository.ts
import { prisma } from '../client';
import type { Prisma, User, UserRole } from '@prisma/client';

export const userRepository = {
  // 단건 조회 (소프트 삭제 자동 필터)
  findById: (id: string) =>
    prisma.user.findFirst({
      where: { id, deletedAt: null },
    }),

  // 목록 조회 (페이지네이션)
  findMany: async (params: {
    page?: number;
    size?: number;
    search?: string;
    role?: UserRole;
  }) => {
    const { page = 1, size = 20, search, role } = params;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role }),
    };

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / size),
    };
  },

  // 생성
  create: (data: Prisma.UserCreateInput) =>
    prisma.user.create({ data }),

  // 업데이트
  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),

  // 소프트 삭제
  softDelete: (id: string) =>
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
};
```

### 쿼리 규칙

```
- 소프트 삭제: 모든 조회에 deletedAt: null 조건 추가
- N+1 문제: include 또는 select로 관계 데이터 한 번에 조회
- 트랜잭션: 여러 테이블 동시 수정 시 prisma.$transaction 사용
- count + findMany: prisma.$transaction([count, findMany]) 동시 실행
- 민감 데이터: select로 필요한 필드만 선택 (password hash 등 제외)
```

---

## 6. 성능 최적화

### 인덱스 설계

```prisma
model Post {
  // 단일 인덱스
  @@index([authorId])
  @@index([createdAt(sort: Desc)])

  // 복합 인덱스 (자주 같이 쿼리되는 필드)
  @@index([authorId, createdAt(sort: Desc)])

  // 유니크 복합 인덱스
  @@unique([authorId, slug])
}
```

### 인덱스 추가 기준

```
인덱스 추가가 필요한 경우:
- WHERE 조건에 자주 사용되는 필드
- ORDER BY에 사용되는 필드
- JOIN에 사용되는 외래키 (Prisma가 자동 생성하지 않을 때)
- LIKE '%...' 검색은 full-text search 고려

인덱스 주의사항:
- 인덱스는 읽기 성능 향상 / 쓰기 성능 저하
- 데이터 변경이 많은 컬럼의 인덱스는 신중히
- EXPLAIN ANALYZE로 쿼리 실행 계획 확인
```

### 슬로우 쿼리 감지

```typescript
// 500ms 이상 쿼리 로그
const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (e) => {
  if (e.duration > 500) {
    console.warn(`Slow query (${e.duration}ms):`, e.query);
  }
});
```

---

## 7. 시드(Seed) 데이터

```typescript
// packages/database/prisma/seed.ts
import { prisma } from '../src/client';

async function main() {
  console.log('Seeding database...');

  // 관리자 계정
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '관리자',
      role: 'ADMIN',
    },
  });

  // 테스트 데이터 (개발 환경만)
  if (process.env.NODE_ENV === 'development') {
    await prisma.user.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        email: `user${i + 1}@example.com`,
        name: `테스트 사용자 ${i + 1}`,
        role: 'MEMBER',
      })),
      skipDuplicates: true,
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
# 시드 실행
pnpm --filter database seed

# package.json에 등록
# "prisma": { "seed": "tsx prisma/seed.ts" }
```

---

## 8. 환경별 DB 설정

```bash
# .env.development
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp_dev"

# .env.staging
DATABASE_URL="postgresql://..."  # 스테이징 DB

# .env.production
DATABASE_URL="postgresql://..."  # 프로덕션 DB (반드시 시크릿으로 관리)

# Connection Pool (프로덕션)
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

### Connection Pooling

```
개발:     직접 연결 (connection_limit 없음)
스테이징: PgBouncer 권장
프로덕션: PgBouncer 필수

Prisma + PgBouncer 설정:
- 연결 문자열에 ?pgbouncer=true 추가
- directUrl 설정 (마이그레이션 전용 직접 연결)
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // PgBouncer를 통한 연결
  directUrl = env("DIRECT_URL")        // 마이그레이션용 직접 연결
}
```

---

## 9. DB 유지보수 체크리스트

### 배포 전

```
- [ ] 마이그레이션 SQL을 직접 읽고 검토했는가?
- [ ] 파괴적 변경(컬럼 삭제/이름 변경)이 있다면 단계별 마이그레이션인가?
- [ ] 인덱스 추가로 인한 잠금 시간을 고려했는가? (CONCURRENTLY 옵션)
- [ ] 롤백 계획이 있는가?
```

### 월간 점검

```
- [ ] 슬로우 쿼리 로그 분석 (500ms 이상)
- [ ] VACUUM / ANALYZE 실행 (자동 설정 확인)
- [ ] DB 크기 및 테이블별 크기 확인
- [ ] 불필요한 인덱스 정리
- [ ] 백업 복원 테스트 (분기별)
```

---

*최종 수정: 2026-06-27*
