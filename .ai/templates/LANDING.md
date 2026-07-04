# Landing Page Prompt Template

Next.js 기반 랜딩/마케팅 페이지 개발 시 AI 요청 프롬프트 템플릿입니다.
SEO, Core Web Vitals, 전환율(CRO)을 중심으로 설계됩니다.

---

## 템플릿 A — 히어로(Hero) 섹션 생성

```
컨텍스트:
- 프레임워크: Next.js (App Router, SSG)
- 스타일: CSS Modules 또는 Tailwind
- 이미지: next/image (최적화 필수)
- 애니메이션: Framer Motion 또는 CSS transition

섹션 이름: HeroSection
위치: widgets/hero/ 또는 views/landing/ui/

콘텐츠:
- 메인 헤드라인: [예: "더 빠른 개발, 더 나은 코드"]
- 서브 헤드라인: [예: "AI와 함께하는 풀스택 개발 템플릿"]
- CTA 버튼 1: [예: "무료로 시작하기" → /signup]
- CTA 버튼 2: [예: "데모 보기" → #demo]
- 히어로 이미지/영상: [예: 대시보드 스크린샷 또는 없음]

레이아웃: [좌측 텍스트 + 우측 이미지 | 중앙 정렬 | 전체화면]

요청:
1. h1 태그는 페이지에서 하나만 사용
2. LCP 최적화: 히어로 이미지에 priority={true} 적용
3. CLS 방지: 이미지에 width/height 또는 aspect-ratio 지정
4. 모바일 first 반응형 레이아웃
5. 버튼 hover/focus 상태 애니메이션

SEO:
- title: [페이지 타이틀]
- description: [메타 설명 160자 이내]
- og:image: [소셜 공유 이미지 경로]
```

---

## 템플릿 B — 기능 소개(Feature) 섹션 생성

```
컨텍스트:
- 아이콘: lucide-react 또는 자체 SVG
- 애니메이션: Intersection Observer 기반 스크롤 진입 효과

섹션 이름: FeaturesSection
레이아웃: [그리드(3열) | 리스트(아이콘+텍스트) | 탭 형식]

기능 항목:
- [기능명]: [제목] / [설명 1-2줄] / [아이콘명]
- [예: speed]: "빠른 개발" / "미리 설정된 구조로 즉시 시작" / Zap
- [예: scale]: "확장 가능한 구조" / "팀이 커져도 유지보수 가능" / TrendingUp
- [예: ai]: "AI 협업 최적화" / "Claude, Antigravity, Codex 역할 분담" / Bot

요청:
1. 카드 hover 시 미세한 elevation 효과
2. 스크롤 진입 시 fade-in + slide-up 애니메이션 (순차적)
3. prefers-reduced-motion 미디어 쿼리로 애니메이션 비활성화 옵션
4. 각 카드에 aria-label 또는 heading 포함
```

---

## 템플릿 C — 가격(Pricing) 섹션 생성

```
컨텍스트:
- 월/연 요금제 토글
- 추천 플랜 강조 (Most Popular 뱃지)

섹션 이름: PricingSection

요금제 정의:
- [플랜명]: [가격(월)] / [연간 할인가] / [추천 여부]
- [예: Free]: 0원 / 0원 / -
- [예: Pro]: 29,000원 / 23,200원 / 추천
- [예: Team]: 99,000원 / 79,200원 / -

각 플랜 기능 목록:
- [예: Free]: API 호출 1,000회/월, 1개 프로젝트
- [예: Pro]: API 호출 무제한, 10개 프로젝트, 우선 지원

CTA:
- Free: "무료로 시작"
- 유료: "14일 무료 체험"

요청:
1. 월/연 토글 시 가격 애니메이션 전환
2. 추천 플랜 카드를 시각적으로 강조 (border, scale, badge)
3. 기능 항목에 포함/미포함 아이콘 명확히 구분
4. FAQ 아코디언을 하단에 추가 (자주 묻는 질문 3-5개)
```

---

## 템플릿 D — CTA(Call-to-Action) 섹션 생성

```
컨텍스트:
- 이메일 수집 폼 또는 단순 버튼 CTA
- 위치: 페이지 하단 또는 콘텐츠 중간

섹션 이름: CTASection
유형: [이메일 구독 폼 | 회원가입 유도 | 문의하기]

콘텐츠:
- 헤드라인: [예: "지금 시작하세요"]
- 서브텍스트: [예: "14일 무료, 신용카드 불필요"]
- CTA: [예: 이메일 입력 + "무료로 시작" 버튼]
- 소셜 증명: [예: "이미 1,200명이 사용 중"]

이메일 구독인 경우:
- API 엔드포인트: [예: POST /api/newsletter/subscribe]
- 성공 시: 성공 메시지 표시
- 실패 시: 에러 메시지 (이미 구독 / 서버 오류)

요청:
1. 폼은 React Hook Form + Zod (이메일 형식 검증)
2. 제출 중 버튼 로딩 상태
3. 배경은 브랜드 컬러 그라디언트 또는 고대비 섹션
```

---

## 템플릿 E — 전체 랜딩 페이지 구성

```
컨텍스트:
- 페이지 경로: app/(marketing)/page.tsx
- 렌더링: SSG (generateMetadata 포함)
- 성능 목표: LCP < 2.5s, CLS < 0.1

페이지 이름: [예: 메인 랜딩 페이지]
타겟: [예: B2B SaaS, 개발자]
주요 전환 목표: [예: 회원가입, 데모 신청]

섹션 구성 (순서):
1. Nav (로고, 메뉴, CTA 버튼)
2. Hero
3. 소셜 증명 (로고 슬라이드 또는 수치)
4. Features (핵심 기능 3-6개)
5. How it works (단계별 설명)
6. Testimonials (사용자 후기)
7. Pricing (선택)
8. FAQ (아코디언)
9. CTA (최종 전환 유도)
10. Footer

SEO 메타데이터:
- title: [타이틀 | 브랜드명]
- description: [설명 160자 이내]
- keywords: [키워드1, 키워드2]
- canonical: [URL]
- og:title / og:description / og:image

요청:
1. 각 섹션을 독립 컴포넌트로 분리
2. generateMetadata 함수 포함
3. JSON-LD 구조화 데이터 (Organization 또는 SoftwareApplication)
4. next/font로 폰트 최적화
5. robots.txt, sitemap.xml 생성 코드 포함
```

---

## 공통 체크리스트 (생성 후 확인)

```
성능 (Core Web Vitals)
- [ ] LCP 요소(이미지/텍스트)에 priority 또는 preload 적용
- [ ] 이미지에 width/height 지정으로 CLS 방지
- [ ] 폰트는 next/font로 최적화됐는가?
- [ ] 중요하지 않은 JS는 동적 import로 지연 로드됐는가?

SEO
- [ ] h1이 페이지에 하나뿐인가?
- [ ] 모든 이미지에 alt 텍스트가 있는가?
- [ ] generateMetadata가 정확히 작성됐는가?
- [ ] 구조화 데이터(JSON-LD)가 포함됐는가?

전환율(CRO)
- [ ] CTA 버튼이 뷰포트 내에 항상 보이는가?
- [ ] 폼 입력 오류가 명확히 표시되는가?
- [ ] 로딩 상태가 사용자에게 피드백을 주는가?

접근성
- [ ] 컬러 대비가 WCAG AA 기준을 충족하는가?
- [ ] 키보드만으로 모든 인터랙션이 가능한가?
- [ ] prefers-reduced-motion 대응이 됐는가?
```

---

## 참고 파일 경로

```
페이지 위치:    app/(marketing)/
레이아웃:      app/(marketing)/layout.tsx
공통 컴포넌트: shared/ui/ 또는 packages/ui/
SEO 유틸:      shared/lib/seo.ts
이미지:        public/images/
```
