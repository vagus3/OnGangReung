# Mobile App Prompt Template

이 파일은 React Native / Expo 기반 모바일 앱 개발 시 AI에게 요청하는 프롬프트 템플릿입니다.
복사 후 [대괄호] 항목을 채워서 사용하세요.

---

## 사용법

1. 아래 템플릿 중 작업 유형에 맞는 것을 선택합니다
2. [대괄호] 항목을 실제 값으로 채웁니다
3. 관련 코드가 있으면 하단에 첨부합니다
4. Claude에게 전달합니다

---

## 템플릿 A — 새 화면(Screen) 생성

```
컨텍스트:
- 프로젝트: React Native + Expo (SDK 51+)
- 네비게이션: Expo Router (파일 기반 라우팅)
- 상태 관리: Zustand (클라이언트), React Query (서버)
- 스타일: StyleSheet / NativeWind
- 현재 레이어: features/[슬라이스명]

화면 이름: [예: ProductDetailScreen]
라우트 경로: [예: /products/[id]]
데이터 출처: [예: GET /api/products/:id]

화면에 포함할 요소:
- [예: 상품 이미지 캐러셀]
- [예: 상품명, 가격, 설명]
- [예: 장바구니 추가 버튼]

요청:
1. FSD features/[슬라이스명] 구조로 파일을 생성해주세요
2. API 호출은 React Query useQuery로
3. 로딩 / 에러 / 빈 상태를 모두 처리해주세요
4. index.ts에 필요한 것만 export 해주세요

제약:
- 서버 데이터를 Zustand store에 저장하지 않습니다
- any 타입 사용 금지
- 스타일은 StyleSheet.create() 사용 (인라인 style 금지)
```

---

## 템플릿 B — 폼(Form) 화면 생성

```
컨텍스트:
- 폼 관리: React Hook Form + Zod 유효성 검사
- 제출 방식: React Query useMutation
- 키보드 처리: KeyboardAvoidingView 포함

폼 이름: [예: CreatePostForm]
API 엔드포인트: [예: POST /api/posts]
필드 목록:
- [필드명]: [타입] / [유효성 규칙]
- [예: title]: string / 최소 2자, 최대 100자
- [예: content]: string / 최소 10자
- [예: imageUrl]: string | null / URL 형식

제출 후 동작: [예: 목록 화면으로 이동 + 쿼리 무효화]

요청:
1. Zod 스키마를 먼저 작성해주세요
2. useForm hook과 Controller 패턴으로 구현해주세요
3. 필드별 에러 메시지를 UI에 표시해주세요
4. 제출 중 버튼 비활성화 처리해주세요
```

---

## 템플릿 C — 목록(List) 화면 생성

```
컨텍스트:
- 목록 컴포넌트: FlashList (성능 최적화)
- 페이지네이션: 무한 스크롤 (useInfiniteQuery)
- 당겨서 새로고침: refreshControl 포함

목록 이름: [예: ProductListScreen]
API 엔드포인트: [예: GET /api/products?page=1&limit=20]
아이템 컴포넌트: [예: ProductCard]
필터/정렬 옵션: [예: 카테고리, 가격순]

요청:
1. useInfiniteQuery로 페이지네이션 구현
2. FlashList의 estimatedItemSize 설정
3. 빈 목록 / 로딩 스켈레톤 / 에러 상태 처리
4. 검색/필터는 URL 파라미터로 관리
```

---

## 템플릿 D — 커스텀 훅 생성

```
컨텍스트:
- 위치: features/[슬라이스명]/model/ 또는 shared/lib/
- 의존성: [사용할 라이브러리 목록]

훅 이름: [예: useNotificationPermission]
목적: [예: 푸시 알림 권한 요청 및 상태 관리]
반환값: [예: { status, requestPermission, isGranted }]

동작 설명:
- [예: 컴포넌트 마운트 시 현재 권한 상태 확인]
- [예: requestPermission 호출 시 OS 권한 다이얼로그 표시]
- [예: 권한 상태 변경 시 리렌더링]

요청:
1. iOS / Android 분기 처리 포함
2. expo-notifications API 사용
3. 단위 테스트 작성 가능한 구조로
```

---

## 공통 체크리스트 (생성 후 확인)

```
레이어 & 구조
- [ ] features/[슬라이스]/index.ts에만 export하는가?
- [ ] 서버 데이터를 Zustand에 저장하지 않았는가?
- [ ] 같은 레이어 슬라이스 간 직접 import가 없는가?

UI & UX
- [ ] 로딩 상태를 처리했는가? (스켈레톤 또는 ActivityIndicator)
- [ ] 에러 상태를 처리했는가? (에러 메시지 + 재시도)
- [ ] 빈 상태(empty state)를 처리했는가?
- [ ] iOS / Android 양쪽에서 확인했는가?

코드 품질
- [ ] any 타입이 없는가?
- [ ] 인라인 style 객체가 없는가? (StyleSheet.create 사용)
- [ ] 불필요한 리렌더링 방지 처리가 됐는가?
```

---

## 참고 파일 경로

```
공통 UI 컴포넌트: packages/ui/
공유 타입:       packages/types/
API 클라이언트:  apps/mobile/src/shared/api/client.ts
네비게이션 설정: apps/mobile/src/app/
Zustand store:  features/[슬라이스]/model/[이름].store.ts
```
