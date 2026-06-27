# Code Review & PR Guide

> 코드 리뷰는 버그를 잡는 것 이상의 의미를 가집니다.
> 팀의 지식을 공유하고, 코드베이스의 일관성을 유지하며, 서로 배우는 기회입니다.
> 이 문서는 Google Engineering Practices와 GitHub Flow를 기반으로 작성됐습니다.

---

## 목차

1. [브랜치 전략](#1-브랜치-전략)
2. [커밋 메시지 규칙](#2-커밋-메시지-규칙)
3. [PR 작성 가이드](#3-pr-작성-가이드)
4. [PR 제출 전 체크리스트](#4-pr-제출-전-체크리스트)
5. [리뷰어 가이드](#5-리뷰어-가이드)
6. [리뷰 우선순위 기준](#6-리뷰-우선순위-기준)
7. [머지 기준](#7-머지-기준)

---

## 1. 브랜치 전략

### GitHub Flow 기반

```
main (항상 배포 가능한 상태)
  └── feature/[티켓번호]-[간단한-설명]
  └── fix/[티켓번호]-[간단한-설명]
  └── refactor/[설명]
  └── chore/[설명]
```

### 브랜치 네이밍

| 타입 | 패턴 | 예시 |
|------|------|------|
| 기능 추가 | `feature/TICKET-설명` | `feature/SHG-123-add-auth` |
| 버그 수정 | `fix/TICKET-설명` | `fix/SHG-456-login-redirect` |
| 리팩터링 | `refactor/설명` | `refactor/auth-layer-split` |
| 문서 | `docs/설명` | `docs/api-guide-update` |
| 인프라/설정 | `chore/설명` | `chore/eslint-config-update` |

### 규칙

- `main` 브랜치에 직접 push는 절대 금지
- 브랜치는 PR 머지 후 즉시 삭제
- 오래된 브랜치(2주 이상 방치)는 팀 동의 후 삭제
- 하나의 브랜치는 하나의 목적만 가진다

---

## 2. 커밋 메시지 규칙

### Conventional Commits 기반

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### 타입 정의

| 타입 | 사용 시점 |
|------|----------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | 포매팅, 세미콜론 등 코드 의미 변경 없음 |
| `docs` | 문서 변경 |
| `test` | 테스트 추가 또는 수정 |
| `chore` | 빌드, 패키지 매니저, 설정 변경 |
| `perf` | 성능 개선 |
| `ci` | CI/CD 관련 변경 |
| `revert` | 이전 커밋 되돌리기 |

### 작성 예시

```bash
# ✅ 좋은 커밋 메시지
feat(auth): add JWT refresh token rotation
fix(user): resolve profile image upload timeout
refactor(dashboard): extract StatCard into widgets layer
docs(api): add authentication endpoint documentation
chore(deps): upgrade react-query to v5

# ❌ 나쁜 커밋 메시지
fix bug
update
wip
asdf
작업중
```

### 커밋 규칙

- 제목은 50자 이내, 명령형으로 작성 (예: "Add" not "Added")
- 제목 끝에 마침표 금지
- 본문은 무엇을 왜 변경했는지 설명 (어떻게는 코드가 설명)
- Breaking change는 footer에 `BREAKING CHANGE:` 명시
- 하나의 커밋은 하나의 논리적 변경만 포함

```bash
# Breaking change 예시
feat(api): change user endpoint response format

BREAKING CHANGE: /api/users now returns { data: User[] }
instead of User[] directly. Update all consumers accordingly.
```

---

## 3. PR 작성 가이드

### PR 제목

커밋 메시지와 동일한 형식 사용:
```
feat(auth): implement Google OAuth login
fix(dashboard): prevent infinite scroll re-render
```

### PR 설명 템플릿

```markdown
## 변경 내용

<!-- 무엇을 변경했는지 간략히 설명 -->

## 변경 이유

<!-- 왜 이 변경이 필요한지 설명 -->

## 스크린샷 / 데모

<!-- UI 변경이 있을 경우 Before/After 스크린샷 첨부 -->

## 테스트 방법

<!-- 리뷰어가 어떻게 테스트할 수 있는지 설명 -->
1. `pnpm dev` 실행
2. `/login` 페이지 접속
3. Google 로그인 버튼 클릭

## 관련 이슈

<!-- 연결된 이슈 번호 -->
Closes #123

## 체크리스트

- [ ] 자체 코드 리뷰 완료
- [ ] 테스트 추가 또는 기존 테스트 통과 확인
- [ ] 문서 업데이트 필요 시 반영
```

### PR 크기 기준

| 크기 | 변경 줄 수 | 처리 방침 |
|------|-----------|----------|
| XS | ~50줄 | 즉시 리뷰 |
| S | 50~200줄 | 당일 리뷰 권장 |
| M | 200~500줄 | 1일 이내 리뷰 |
| L | 500줄 이상 | 분리 강력 권고 |

> 500줄 초과 PR은 리뷰어가 분리 요청을 할 수 있습니다.
> 불가피한 경우(마이그레이션, 대규모 리팩터링) 사전에 팀과 논의하세요.

---

## 4. PR 제출 전 체크리스트

### 아키텍처 & 코드 품질

```markdown
- [ ] FSD 레이어 의존성 방향을 위반하지 않았는가?
- [ ] 슬라이스 내부를 외부에서 직접 import하지 않았는가? (index.ts 경유)
- [ ] 함수/컴포넌트가 단일 책임 원칙을 지키는가?
- [ ] 200줄 이상의 파일이 있다면 분리를 검토했는가?
- [ ] `any` 타입을 사용하지 않았는가?
- [ ] `console.log`를 모두 제거했는가?
- [ ] 불필요한 주석(TODO 제외)을 제거했는가?
```

### 상태 관리

```markdown
- [ ] 서버 데이터를 Zustand store에 저장하지 않았는가?
- [ ] 로컬 상태가 필요 이상으로 전역화되지 않았는가?
- [ ] React Query의 queryKey가 명확하고 일관성 있는가?
```

### 보안

```markdown
- [ ] 민감한 정보(토큰, 비밀번호, API 키)를 코드에 하드코딩하지 않았는가?
- [ ] 사용자 입력값을 적절히 검증/이스케이프 처리하는가?
- [ ] 인증/인가 로직이 누락된 엔드포인트는 없는가?
```

### 환경변수 & 설정

```markdown
- [ ] 새 환경변수를 .env.example에 추가했는가?
- [ ] 백엔드 전용 변수에 NEXT_PUBLIC_ 접두사를 사용하지 않았는가?
```

### 테스트

```markdown
- [ ] 새로운 비즈니스 로직에 단위 테스트를 추가했는가?
- [ ] 기존 테스트가 모두 통과하는가? (`pnpm test`)
- [ ] 엣지 케이스(빈 값, 에러 상태)를 테스트했는가?
```

---

## 5. 리뷰어 가이드

### 리뷰 응답 접두사 (Conventional Comments)

리뷰 코멘트에 아래 접두사를 붙여 의도를 명확히 합니다:

| 접두사 | 의미 |
|--------|------|
| `[blocker]` | 머지 불가. 반드시 수정 필요 |
| `[should]` | 강력 권고. 이번 PR에서 수정 권장 |
| `[nit]` | 사소한 개선 제안. 선택사항 |
| `[question]` | 이해를 위한 질문. 수정 요구 아님 |
| `[praise]` | 긍정적 피드백. 잘된 부분 언급 |
| `[thought]` | 아이디어 공유. 지금 당장 적용 불필요 |

```markdown
# 예시

[blocker] 레이어 의존성 위반입니다. shared에서 features를 import할 수 없습니다.

[should] 에러 처리가 누락됐습니다. try-catch 또는 onError 핸들러를 추가해주세요.

[nit] 변수명이 너무 축약됐습니다. `usr` → `user`로 바꾸면 더 명확합니다.

[question] 이 함수가 두 곳에서 호출되는데, 성능 이슈는 없을까요?

[praise] 이 패턴 정말 깔끔하네요! 다른 곳에도 적용하면 좋겠습니다.
```

### 리뷰 시 집중 포인트

#### Must Fix (머지 불가)
- 레이어 의존성 방향 위반
- 보안 취약점 (XSS, CSRF, 민감 정보 노출, 인증 우회)
- 타입 안전성 파괴 (`any` 남용, `as unknown as` 오남용)
- 환경변수 하드코딩
- 데이터 유실 가능성이 있는 로직

#### Should Fix (강력 권고)
- 네이밍 컨벤션 미준수
- 서버 상태를 전역 스토어에 저장
- 에러 처리 누락 (특히 API 호출)
- 과도한 컴포넌트 크기 (200줄 이상)
- 중복 코드 (DRY 원칙 위반)

#### Nice to Have (선택)
- 성능 최적화 (메모이제이션, lazy loading)
- 접근성(a11y) 개선
- 더 나은 추상화 제안
- 추가 테스트 케이스

### 리뷰 태도 원칙

- 코드를 비판하되, 사람을 비판하지 않는다
- "왜 이렇게 했나요?" 보다 "이렇게 하면 어떨까요?"
- 칭찬도 적극적으로 남긴다 (`[praise]`)
- 블로커가 없으면 `nit` 때문에 머지를 늦추지 않는다
- 리뷰 요청 후 24시간 이내 첫 응답 (비즈니스 시간 기준)

---

## 6. 리뷰 우선순위 기준

| 우선순위 | 기준 |
|---------|------|
| P0 — 즉시 | 프로덕션 버그 수정, 보안 이슈 |
| P1 — 당일 | 기능 개발 PR (블로킹 없는 것) |
| P2 — 1일 내 | 리팩터링, 테스트 추가 |
| P3 — 여유 | 문서 업데이트, 설정 변경 |

---

## 7. 머지 기준

### 머지 조건

```markdown
- [ ] 최소 1명의 Approve
- [ ] 모든 [blocker] 코멘트 해결
- [ ] CI 파이프라인 전체 통과 (lint, type-check, test, build)
- [ ] PR 작성자가 최종 확인 후 머지
```

### 머지 방식

```bash
# Squash Merge 권장 (기능 단위 커밋 유지)
# main 브랜치의 커밋 히스토리를 깔끔하게 유지

git merge --squash feature/SHG-123-add-auth
```

| 머지 방식 | 사용 상황 |
|----------|----------|
| Squash Merge | 기능 개발, 버그 수정 (기본) |
| Merge Commit | 릴리즈 브랜치, 대규모 기능 |
| Rebase | 사용 금지 (공유 브랜치에서) |

### 머지 후

1. 브랜치 즉시 삭제
2. 연결된 이슈 자동 닫힘 확인 (`Closes #123`)
3. 필요 시 팀 슬랙 채널에 변경 사항 공유

---

*최종 수정: 2026-06-27*
