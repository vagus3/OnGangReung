# Design System Guide

> UI/UX 일관성을 위한 디자인 원칙과 시스템을 정의합니다.
> Brad Frost의 Atomic Design 방법론과 WCAG 2.1 접근성 기준을 기반으로 작성됐습니다.

---

## 목차

1. [디자인 철학](#1-디자인-철학)
2. [Atomic Design 컴포넌트 계층](#2-atomic-design-컴포넌트-계층)
3. [디자인 토큰](#3-디자인-토큰)
4. [타이포그래피](#4-타이포그래피)
5. [컬러 시스템](#5-컬러-시스템)
6. [간격 & 레이아웃](#6-간격--레이아웃)
7. [컴포넌트 설계 원칙](#7-컴포넌트-설계-원칙)
8. [다크 모드](#8-다크-모드)
9. [접근성(a11y)](#9-접근성a11y)
10. [반응형 디자인](#10-반응형-디자인)
11. [애니메이션 원칙](#11-애니메이션-원칙)

---

## 1. 디자인 철학

| 원칙 | 설명 |
|------|------|
| 일관성(Consistency) | 같은 역할의 요소는 항상 같은 모습으로 |
| 명확성(Clarity) | 사용자가 다음에 무엇을 해야 할지 즉시 알 수 있게 |
| 효율성(Efficiency) | 최소한의 인터랙션으로 최대한의 결과 |
| 접근성(Accessibility) | 모든 사용자가 사용 가능하게 |
| 점진적 공개(Progressive Disclosure) | 필요한 정보만 필요한 시점에 |

---

## 2. Atomic Design 컴포넌트 계층

```
Atoms → Molecules → Organisms → Templates → Pages
```

| 계층 | 설명 | 예시 |
|------|------|------|
| Atoms | 더 이상 분해할 수 없는 기본 요소 | `Button`, `Input`, `Label`, `Icon` |
| Molecules | Atom 2개 이상의 조합 | `SearchField`, `FormField`, `NavItem` |
| Organisms | 독립적인 UI 섹션 | `Header`, `ProductCard`, `LoginForm` |
| Templates | 레이아웃 구조 정의 | `DashboardLayout`, `AuthLayout` |
| Pages | 실제 데이터가 채워진 완성된 화면 | `DashboardPage`, `LoginPage` |

### FSD와의 매핑

```
Atoms / Molecules  →  shared/ui
Organisms          →  widgets/
Templates          →  shared/ui/layouts
Pages              →  pages/
```

---

## 3. 디자인 토큰

디자인 토큰은 CSS 변수로 정의하고 Tailwind config 또는 `globals.css`에서 관리합니다.

```css
/* shared/styles/tokens.css */
:root {
  /* === Colors === */
  --color-primary-50:  #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* === Typography === */
  --font-family-base: 'Inter', -apple-system, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  --font-size-xs:   0.75rem;   /* 12px */
  --font-size-sm:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.125rem;  /* 18px */
  --font-size-xl:   1.25rem;   /* 20px */
  --font-size-2xl:  1.5rem;    /* 24px */
  --font-size-3xl:  1.875rem;  /* 30px */
  --font-size-4xl:  2.25rem;   /* 36px */

  /* === Spacing === */
  --space-1:  0.25rem;  /* 4px */
  --space-2:  0.5rem;   /* 8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-6:  1.5rem;   /* 24px */
  --space-8:  2rem;     /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* === Border Radius === */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* === Shadow === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* === Z-index === */
  --z-base:    0;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-modal:    300;
  --z-toast:    400;
  --z-tooltip:  500;

  /* === Transition === */
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   400ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 4. 타이포그래피

### 폰트 사용 기준

| 역할 | 폰트 | 용도 |
|------|------|------|
| 기본 UI | Inter | 본문, 레이블, 버튼 |
| 코드 | JetBrains Mono | 코드 블록, 기술 정보 |
| 브랜딩 | 프로젝트별 선택 | 헤드라인, 랜딩 |

### 타입 스케일

```typescript
// 사용 기준
const typography = {
  'display-xl': { size: '4xl', weight: '800', lineHeight: '1.1' }, // 히어로 헤드라인
  'display-lg': { size: '3xl', weight: '700', lineHeight: '1.2' }, // 섹션 타이틀
  'heading-xl': { size: '2xl', weight: '600', lineHeight: '1.3' }, // 페이지 타이틀
  'heading-lg': { size: 'xl',  weight: '600', lineHeight: '1.4' }, // 카드 타이틀
  'heading-md': { size: 'lg',  weight: '500', lineHeight: '1.5' }, // 서브 타이틀
  'body-lg':    { size: 'base',weight: '400', lineHeight: '1.7' }, // 본문 (대)
  'body-md':    { size: 'sm',  weight: '400', lineHeight: '1.6' }, // 본문 (소)
  'label':      { size: 'sm',  weight: '500', lineHeight: '1.4' }, // 레이블
  'caption':    { size: 'xs',  weight: '400', lineHeight: '1.4' }, // 캡션, 설명
};
```

### 가독성 규칙

- 본문 텍스트 최대 너비: `65ch` (약 65자)
- 줄 간격: 본문 `1.6~1.7`, 헤딩 `1.1~1.3`
- 텍스트 색상은 배경 대비 4.5:1 이상 (WCAG AA 기준)

---

## 5. 컬러 시스템

### 시맨틱 컬러 (역할 기반)

```css
:root {
  /* Brand */
  --color-brand-primary:   var(--color-primary-500);
  --color-brand-secondary: var(--color-secondary-500);

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
  --color-info:    #3b82f6;

  /* Neutral (Light mode) */
  --color-bg-primary:   #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary:  #f3f4f6;

  --color-text-primary:   #111827;
  --color-text-secondary: #6b7280;
  --color-text-disabled:  #9ca3af;

  --color-border-default: #e5e7eb;
  --color-border-strong:  #d1d5db;
}
```

### 컬러 사용 원칙

- Primary: 핵심 액션 (CTA 버튼, 링크, 선택 상태)
- Secondary: 보조 액션, 강조 배지
- Neutral: 텍스트, 배경, 구분선
- Semantic: 피드백 (성공/경고/에러/정보)

```typescript
// ❌ 나쁨: 하드코딩된 색상
<div style={{ color: '#3b82f6' }} />

// ✅ 좋음: 토큰 사용
<div className="text-brand-primary" />
// 또는
<div style={{ color: 'var(--color-brand-primary)' }} />
```

---

## 6. 간격 & 레이아웃

### 8px 그리드 시스템

모든 간격은 4px의 배수를 기본으로, 8px의 배수를 권장합니다.

```
4px  → 아주 좁은 내부 패딩 (아이콘 ↔ 텍스트)
8px  → 컴포넌트 내부 패딩 (소)
12px → 컴포넌트 내부 패딩 (중)
16px → 컴포넌트 내부 패딩 (기본)
24px → 컴포넌트 간격
32px → 섹션 내부 간격
48px → 섹션 간격
64px → 페이지 섹션 간격
```

### 레이아웃 최대 너비

```css
--max-width-content: 720px;   /* 읽기 전용 콘텐츠 */
--max-width-normal:  1024px;  /* 일반 페이지 */
--max-width-wide:    1280px;  /* 대시보드, 테이블 */
--max-width-full:    1536px;  /* 와이드 레이아웃 */
```

---

## 7. 컴포넌트 설계 원칙

### Composition 우선

```tsx
// ❌ Props 드릴링 방식
<Card title="User" description="..." footer="..." avatar="..." />

// ✅ Composition 방식
<Card>
  <Card.Header>
    <Avatar src={user.avatar} />
    <Card.Title>User</Card.Title>
  </Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

### Variant 패턴

```tsx
// 버튼 variant 예시
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
}
```

### 컴포넌트 크기 제한

| 기준 | 권장 | 경고 |
|------|------|------|
| 파일 줄 수 | ~100줄 | 200줄 초과 시 분리 |
| Props 수 | ~5개 | 8개 초과 시 리팩터링 |
| 중첩 깊이 | 3단계 | 5단계 초과 시 분리 |

---

## 8. 다크 모드

### CSS 변수 기반 다크 모드

```css
/* 라이트 모드 기본값 → :root에 정의 */
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
}

/* 다크 모드 오버라이드 */
[data-theme='dark'] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f8fafc;
}

/* 시스템 설정 따르기 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-bg-primary: #0f172a;
    --color-text-primary: #f8fafc;
  }
}
```

### 다크 모드 구현 규칙

- 이미지: 다크 모드에서 밝기 조정 (`filter: brightness(0.85)`)
- 그림자: 다크에서는 그림자 대신 `border` 또는 `glow` 사용
- 색상은 반드시 CSS 변수로만 — 하드코딩 금지

---

## 9. 접근성(a11y)

### WCAG 2.1 AA 기준 준수

| 항목 | 기준 |
|------|------|
| 색상 대비 (일반 텍스트) | 4.5:1 이상 |
| 색상 대비 (큰 텍스트) | 3:1 이상 |
| 포커스 표시 | 항상 visible |
| 클릭 타겟 크기 | 최소 44×44px |
| 키보드 네비게이션 | 모든 인터랙티브 요소 |

### 필수 구현 사항

```tsx
// ✅ 이미지 alt 텍스트
<img src={avatar} alt={`${user.name}의 프로필 사진`} />
// 장식용 이미지
<img src={decoration} alt="" role="presentation" />

// ✅ 버튼 레이블
<button aria-label="검색">
  <SearchIcon />
</button>

// ✅ 폼 레이블
<label htmlFor="email">이메일</label>
<input id="email" type="email" />

// ✅ 에러 메시지 연결
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
<p id="email-error" role="alert">{error}</p>

// ✅ 모달 포커스 트랩
<dialog aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">제목</h2>
</dialog>

// ✅ 동적 콘텐츠 업데이트 알림
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## 10. 반응형 디자인

### 브레이크포인트

| 이름 | 최솟값 | 용도 |
|------|--------|------|
| `xs` | 320px | 소형 모바일 |
| `sm` | 640px | 모바일 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크탑 |
| `xl` | 1280px | 데스크탑 |
| `2xl` | 1536px | 대형 화면 |

### Mobile First 원칙

```css
/* ✅ Mobile First */
.container {
  padding: 1rem;         /* 모바일 기본 */
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;       /* 태블릿+ */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 3rem;       /* 데스크탑+ */
  }
}
```

---

## 11. 애니메이션 원칙

### 애니메이션 목적

- 피드백: 사용자 액션에 즉각 반응
- 전환: 상태 변화를 부드럽게 연결
- 주목: 중요한 정보에 시선 유도

### 지속 시간 기준

```css
/* 마이크로 인터랙션: hover, 클릭 */
--duration-fast: 150ms;

/* 일반 전환: 슬라이드, 페이드 */
--duration-normal: 250ms;

/* 복잡한 애니메이션: 모달, 페이지 전환 */
--duration-slow: 400ms;
```

### 접근성 고려

```css
/* 애니메이션 비선호 사용자 대응 (필수) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 사용 금지

- 단순 정보 전달에 3초 이상 애니메이션
- 자동 재생되는 깜빡임 효과 (발작 위험)
- 레이아웃을 바꾸는 `top/left` 애니메이션 (→ `transform` 사용)

---

*최종 수정: 2026-06-27*
