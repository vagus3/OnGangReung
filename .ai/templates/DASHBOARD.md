# Dashboard Prompt Template

Next.js 기반 대시보드 / 어드민 패널 개발 시 AI 요청 프롬프트 템플릿입니다.

---

## 템플릿 A — 데이터 테이블 생성

```
컨텍스트:
- 프레임워크: Next.js (App Router)
- 테이블 라이브러리: TanStack Table v8
- 데이터: React Query useQuery / useInfiniteQuery
- UI: shadcn/ui 또는 자체 shared/ui 컴포넌트

테이블 이름: [예: UsersTable]
위치: features/[슬라이스명]/ui/
데이터 API: [예: GET /api/admin/users?page=1&size=20&sort=createdAt:desc]

컬럼 정의:
- [컬럼키]: [헤더명] / [정렬가능 여부] / [커스텀 렌더링]
- [예: name]: 이름 / 정렬가능 / -
- [예: email]: 이메일 / 정렬가능 / -
- [예: role]: 역할 / - / Badge 컴포넌트
- [예: createdAt]: 가입일 / 정렬가능 / formatDate() 적용
- [예: actions]: - / - / 수정/삭제 버튼

기능 요구사항:
- [ ] 서버사이드 페이지네이션
- [ ] 컬럼 정렬 (서버에 sort 파라미터 전달)
- [ ] 행 선택 (체크박스)
- [ ] 검색 필터 (debounce 300ms)
- [ ] 컬럼 표시/숨기기

요청:
1. TanStack Table의 useReactTable 훅 기반으로 구현
2. URL 쿼리 파라미터로 페이지/정렬/필터 상태 동기화 (nuqs 사용)
3. 로딩 시 스켈레톤 행 표시
4. 테이블 상태는 URL에 직렬화하여 새로고침 후에도 유지
```

---

## 템플릿 B — 차트 위젯 생성

```
컨텍스트:
- 차트 라이브러리: Recharts 또는 Chart.js
- 위치: widgets/[위젯명]/ 또는 features/[슬라이스]/ui/
- 데이터 새로고침: React Query staleTime 설정

위젯 이름: [예: RevenueChart]
차트 유형: [라인 | 바 | 파이 | 에어리어 | 복합]
데이터 API: [예: GET /api/analytics/revenue?range=30d]
X축: [예: 날짜 (YYYY-MM-DD)]
Y축: [예: 매출액 (단위: 원)]

기능 요구사항:
- [ ] 기간 선택 (7일 / 30일 / 90일)
- [ ] 툴팁 커스터마이징
- [ ] 반응형 (ResizeObserver 기반)
- [ ] 다크 모드 대응

요청:
1. 기간 상태는 URL 쿼리 파라미터로 관리
2. 로딩 시 차트 영역에 스켈레톤 표시
3. 에러 시 "데이터를 불러올 수 없습니다" + 재시도 버튼
4. 숫자는 Intl.NumberFormat으로 포맷팅
```

---

## 템플릿 C — 필터 패널 생성

```
컨텍스트:
- 필터 상태: URL 쿼리 파라미터 (nuqs)
- 폼: React Hook Form (필터 변경 시 자동 제출)
- 위치: features/[슬라이스]/ui/[이름]FilterPanel.tsx

필터 이름: [예: UserFilterPanel]
연결 테이블/목록: [예: UsersTable]

필터 항목:
- [필터명]: [유형] / [옵션]
- [예: status]: select / [all, active, inactive, banned]
- [예: role]: multi-select / [admin, manager, member]
- [예: dateRange]: date-range-picker / [오늘, 7일, 30일, 직접 입력]
- [예: search]: text-input / debounce 300ms

요청:
1. 필터 변경 즉시 URL 업데이트 (useQueryState 사용)
2. "필터 초기화" 버튼으로 전체 필터 리셋
3. 활성 필터 수 뱃지 표시
4. 모바일에서는 Sheet/Drawer로 접이식 구성
```

---

## 템플릿 D — 통계 카드(KPI) 생성

```
컨텍스트:
- 위치: widgets/[이름]/ 또는 features/[슬라이스]/ui/
- 데이터: React Query, staleTime 5분

카드 그룹 이름: [예: SalesSummaryCards]
API: [예: GET /api/analytics/summary]

카드 항목:
- [예: totalRevenue]: 총 매출 / 원 단위 / 전월 대비 증감률
- [예: newUsers]: 신규 가입 / 명 / 전주 대비
- [예: conversionRate]: 전환율 / % / 전월 대비
- [예: avgOrderValue]: 평균 주문금액 / 원 / 전월 대비

요청:
1. 증감률은 양수(초록↑) / 음수(빨강↓) / 동일(회색→) 색상 구분
2. 숫자 애니메이션 (CountUp)
3. 로딩 시 스켈레톤 카드
4. 그리드 레이아웃 (4열 → 2열 → 1열 반응형)
```

---

## 템플릿 E — CRUD 모달 생성

```
컨텍스트:
- 모달: shadcn/ui Dialog 또는 Sheet
- 폼: React Hook Form + Zod
- API: React Query useMutation

모달 이름: [예: EditUserModal]
작업 유형: [create | edit | delete]
API 엔드포인트:
- 조회: [예: GET /api/users/:id] (edit인 경우)
- 제출: [예: PATCH /api/users/:id]

폼 필드:
- [필드명]: [타입] / [유효성 규칙] / [초기값]

제출 후 동작:
- 쿼리 무효화: [예: ['users'] 키]
- 토스트 알림: [예: "사용자 정보가 수정됐습니다"]
- 모달 닫기

요청:
1. useQuery로 현재 데이터 로드 (edit인 경우)
2. useMutation의 onSuccess / onError 처리
3. 제출 중 폼 비활성화
4. 유효성 에러 메시지를 필드 하단에 표시
```

---

## 공통 체크리스트 (생성 후 확인)

```
데이터 & 상태
- [ ] 서버 상태를 React Query로만 관리하는가?
- [ ] URL 상태(페이지/필터/정렬)를 쿼리 파라미터로 동기화하는가?
- [ ] staleTime / gcTime 설정이 있는가?

UI & UX
- [ ] 로딩 스켈레톤이 실제 컨텐츠와 같은 레이아웃인가?
- [ ] 에러 상태에서 재시도 옵션을 제공하는가?
- [ ] 빈 상태(empty state)가 명확한 설명과 함께 있는가?
- [ ] 모바일/태블릿 브레이크포인트 대응이 됐는가?

접근성
- [ ] 테이블에 aria-label이 있는가?
- [ ] 모달이 포커스 트랩을 구현하는가?
- [ ] 폼 필드에 htmlFor / aria-describedby가 연결됐는가?
```

---

## 참고 파일 경로

```
공통 UI:      packages/ui/ 또는 shared/ui/
레이아웃:     app/(dashboard)/layout.tsx
API 클라이:   shared/api/client.ts
queryClient:  shared/api/queryClient.ts
엔드포인트:   shared/config/apiEndpoints.ts
```
