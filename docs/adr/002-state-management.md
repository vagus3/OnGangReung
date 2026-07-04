# 002. 상태 관리 전략 — Zustand + TanStack Query

날짜: 2026-06-27
상태: Accepted

## 배경 (Context)

프론트엔드에서 상태 관리가 필요한 데이터는 두 종류입니다:

1. 서버에서 오는 원격 데이터 (사용자 목록, 게시물 등)
2. 클라이언트 전용 상태 (인증 토큰, 테마, 모달 열림 여부 등)

기존에 Redux를 써왔으나 서버 상태를 직접 관리하는 코드가 과도하게 많아졌습니다.

## 선택지 (Options)

1. Redux Toolkit + RTK Query
   - 장점: 생태계 성숙, 강력한 DevTools
   - 단점: 보일러플레이트 많음, 번들 크기 큼

2. Zustand + TanStack Query (React Query)
   - 장점: 가볍고 직관적, 서버/클라이언트 상태 명확히 분리
   - 단점: 두 개 라이브러리 학습 필요

3. Jotai + TanStack Query
   - 장점: 원자 단위 상태, React 모델에 가장 가까움
   - 단점: 팀 친숙도 낮음

## 결정 (Decision)

서버 상태는 TanStack Query(React Query), 클라이언트 전용 상태는 Zustand로 명확히 분리합니다.

핵심 규칙: 서버 데이터를 절대 Zustand store에 저장하지 않습니다.

## 결과 (Consequences)

긍정적:

- 캐싱, 동기화, 로딩/에러 처리를 React Query가 담당 → 직접 구현 불필요
- Zustand는 인증, 테마 등 순수 클라이언트 상태에만 집중
- 번들 크기 Redux 대비 ~70% 감소

부정적:

- 두 가지 상태 도구를 팀이 모두 알아야 함
- "이 데이터가 서버 상태인가 클라이언트 상태인가" 판단이 필요

향후 고려사항:

- 폼 상태는 React Hook Form으로 별도 관리
- URL 상태(필터/페이지)는 nuqs로 관리
