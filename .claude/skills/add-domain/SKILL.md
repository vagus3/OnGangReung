---
name: add-domain
description: 새 CRUD 도메인 하나를 백엔드부터 프론트 페이지까지 끝까지 추가할 때 사용. posts를 표준 예시로 삼아 model → schema → service → router → codegen → entities → features → views 순서를 지키고, 각 단계마다 검증한다. 도메인/리소스/CRUD/엔드포인트 추가 요청에 사용.
---

# 도메인 추가

posts 도메인이 이 레포의 표준 예시다. 새 도메인은 그 구조를 그대로 복제한다.
아래 순서는 의존성 방향(`api → services → models`, `app → views → widgets →
features → entities → shared`)을 따르므로 건너뛰거나 뒤집지 않는다.

각 단계 뒤에 검증을 돌린다. 마지막에 몰아서 하지 않는다 — 어느 단계에서
깨졌는지 알 수 없게 된다.

## 0. 범위 확정

시작 전에 확정할 것:

- 도메인 이름 (단수형 소문자, 예: `comment`)
- 필드와 타입, nullable 여부
- 필요한 엔드포인트 (전부 CRUD인지, list/create만인지)
- 프론트에서 어떤 feature가 이 데이터를 쓰는지

2개 이상의 feature가 같은 도메인 데이터를 쓰면 React Query 훅은
`entities/[domain]/model/`에 둔다. 한 feature만 쓰면 `features/[feature]/model/`에
둔다. 이 판단을 먼저 하고 시작한다.

## 1. 백엔드

posts와 같은 순서로 파일을 만든다. 각 파일의 형태는 대응하는 posts 파일을
그대로 참고한다.

| 순서 | 파일                                | 참고할 기존 파일       |
| ---- | ----------------------------------- | ---------------------- |
| 1    | `apps/api/app/models/[domain].py`   | `app/models/post.py`   |
| 2    | `apps/api/app/schemas/[domain].py`  | `app/schemas/post.py`  |
| 3    | `apps/api/app/services/[domain].py` | `app/services/post.py` |
| 4    | `apps/api/app/api/v1/[domain]s.py`  | `app/api/v1/posts.py`  |

배선 두 곳을 빠뜨리기 쉽다:

- `app/models/__init__.py` — 새 모델을 import하고 `__all__`에 추가.
  Alembic autogenerate가 이 import를 통해 모델을 발견하므로 빠지면
  마이그레이션이 비어서 생성된다.
- `app/api/v1/router.py` — `api_router.include_router(...)`로 등록.

커밋은 서비스 레이어가 소유한다. 라우터는 경계에서 ORM → Pydantic DTO 변환만
한다. 이 방향이 뒤집히면 리뷰에서 반려된다.

### 마이그레이션

```bash
cd apps/api
uv run alembic revision --autogenerate -m "create [domain]s table"
uv run alembic upgrade head
```

생성된 파일을 반드시 열어서 확인한다. autogenerate는 인덱스와 제약을
놓치는 경우가 있다.

### 검증

```bash
pnpm --filter api test
pnpm type-check
```

`apps/api/tests/test_[domain]s.py`를 `tests/test_posts.py` 패턴으로 먼저
작성하고 나서 통과시킨다. 커버리지 하한선(85%)이 걸려 있으므로 테스트
없이 코드만 늘리면 여기서 막힌다.

## 2. 타입 공유

백엔드 스키마가 바뀌었으므로 같은 커밋에서 코드젠을 돌린다.

```bash
pnpm codegen
```

`packages/api-client/openapi.json`과 `src/types.ts`가 갱신된다.
이걸 빠뜨리면 CI의 drift 검사가 막는다.

## 3. 프론트엔드

| 순서 | 경로                                       | 참고할 기존 파일                   |
| ---- | ------------------------------------------ | ---------------------------------- |
| 1    | `entities/[domain]/api/[domain].api.ts`    | `entities/post/api/post.api.ts`    |
| 2    | `entities/[domain]/model/[domain].keys.ts` | `entities/post/model/post.keys.ts` |
| 3    | `entities/[domain]/model/use[Domain]s.ts`  | `entities/post/model/usePosts.ts`  |
| 4    | `entities/[domain]/index.ts`               | `entities/post/index.ts`           |
| 5    | `features/[feature]/...`                   | `features/post-create/`            |
| 6    | `views/[domain]s/...`                      | `views/posts/`                     |
| 7    | `app/[domain]s/page.tsx`                   | `app/posts/page.tsx`               |

지켜야 할 것:

- 슬라이스마다 `index.ts` 공개 API 필수. 다른 슬라이스는 내부 경로를 직접
  import하지 않는다.
- API 에러는 `shared/api`의 `toApiError`로 변환해서 던진다. 고정 문자열
  Error를 던지면 백엔드가 내려주는 `detail`/`code`가 버려진다.
- 서버 상태는 React Query에만 둔다. Zustand 등 클라이언트 상태 저장소에
  넣지 않는다.
- 페이지는 서버 컴포넌트로 만들고 `HydrationBoundary`로 프리페치한다.
  데이터를 읽는 부분만 `"use client"` + `useSuspenseQuery`로 분리하고
  `Suspense`와 `shared/ui`의 `ErrorBoundary`로 감싼다.
  `app/posts/page.tsx` + `views/posts/ui/PostsList.tsx`가 그 형태다.

### 검증

```bash
pnpm verify
```

## 4. 마무리

- `docs/CHANGELOG.md`의 `## [Unreleased]` → `### Added`에 항목 추가
- 커밋은 기능 단위로 쪼갠다. 백엔드 / 코드젠 / 프론트 엔티티 / 프론트 UI는
  각각 별도 커밋이 자연스러운 경계다.
- 설계 판단이 필요한 지점을 만났으면 임의로 정하지 말고 결과에
  "설계 판단 필요"로 남긴다.

_Last Modified: 2026-08-30_
