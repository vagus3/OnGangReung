# Design System

<!-- 한국어 요약: 이 문서는 모든 프로젝트에 적용되는 기본 디자인 규칙(컬러, 타이포그래피, 레이아웃, 컴포넌트, 접근성)을 정의합니다. AI 참고 목적으로 영문으로 작성되었습니다. -->

> Default design rules for every project.
> All UI implementations must follow these guidelines unless project-specific design files override them.

---

## 1. Design Identity

| Aspect          | Direction                                            |
| --------------- | ---------------------------------------------------- |
| Feel            | Premium, minimal, modern, fast, intuitive            |
| Inspired by     | Apple, Toss, Linear, Vercel                          |
| Core philosophy | "Less, but better."                                  |
| Focus           | Content first, smooth experience, clear hierarchy    |
| Avoid           | Over-designed UI, complex visual effects, trend-only design |

---

## 2. UI Principles

### Simplicity First

Every screen must have one clear primary action and answer: "What should the user do here?"

Remove: unnecessary buttons, duplicated information, meaningless decoration.

### Mobile First

Design priority: Mobile → Tablet → Desktop.
Mobile is not a smaller desktop; desktop is an expansion of mobile.

### Consistency

Never create new styles without checking existing components first.
Reuse: `Button`, `Card`, `Modal`, `Input`, `Navigation`.

---

## 3. Color System

Default theme: Dark Mode First.

| Token          | Value             |
| -------------- | ----------------- |
| bg/primary     | `#050505`         |
| bg/secondary   | `#111111`         |
| bg/surface     | `#181818`         |
| bg/elevated    | `#202020`         |
| text/primary   | `#FFFFFF`         |
| text/secondary | `#A1A1AA`         |
| text/muted     | `#71717A`         |
| brand/primary  | `#8B5CF6`         |
| brand/hover    | Slightly brighter |
| brand/active   | Slightly darker   |
| status/success | Green             |
| status/warning | Yellow            |
| status/error   | Red               |

> CAUTION: Never use status colors for decoration.

---

## 4. Typography

Default fonts — English: `Inter`, Korean: `Pretendard`.

| Role          | Size | Weight |
| ------------- | ---- | ------ |
| Page Title    | 32px | 700    |
| Section Title | 20px | 600    |
| Body          | 16px | 400    |
| Caption       | 14px | 400    |

Avoid: too many font sizes, decorative fonts, random weights.

---

## 5. Layout System

8px spacing system. Allowed spacing values: `4 / 8 / 16 / 24 / 32 / 48 / 64` px.

> CAUTION: Never use random spacing values.

| Container | Rule                            |
| --------- | ------------------------------- |
| Mobile    | padding 16px                    |
| Desktop   | max-width 1200px, center aligned |

---

## 6. Components

### Button

| Property   | Value                        |
| ---------- | ---------------------------- |
| Height     | 48px                         |
| Radius     | 12px                         |
| Padding    | horizontal 16px              |
| Hover      | brightness increase          |
| Click      | scale 0.98                   |
| Transition | 150-200ms                    |

- Primary (important actions): brand background, white text
- Secondary (optional actions): surface background, subtle border

### Card

| Property   | Value        |
| ---------- | ------------ |
| Background | surface      |
| Radius     | 20px         |
| Padding    | 24px         |
| Shadow     | minimal only |

Use to group related information. Avoid heavy shadows.

### Input

Height 48px, radius 12px. Always provide: label, error state, focus state.

### Modal

Use only for confirmation or a focused task. Avoid nested modals.

### Navigation

| Platform | Pattern                                        |
| -------- | ---------------------------------------------- |
| Mobile   | Bottom navigation, max 5 tabs (Home, Search, Content, My Page) |
| Desktop  | Sidebar or top navigation                      |

---

## 7. Animation

Prefer `Framer Motion`.

| Interaction       | Duration |
| ----------------- | -------- |
| Small interaction | 150ms    |
| Page transition   | 300ms    |

Allowed: opacity, translate, scale.
Avoid: bounce, rotation, unnecessary motion.

---

## 8. Responsive Rules

| Breakpoint | Range      | Layout        |
| ---------- | ---------- | ------------- |
| Mobile     | 0-640px    | single column |
| Tablet     | 640-1024px | 2 columns     |
| Desktop    | 1024px+    | multi-column  |

---

## 9. Accessibility

Required: semantic HTML, keyboard navigation, `aria-label` when needed.

- Contrast: WCAG AA minimum
- Never rely only on color to convey meaning

---

## 10. Tailwind Rules

Prefer: `flex`, `grid`, `gap`, `space`.

```tsx
// Bad — inline style
<div style={{ marginTop: "17px" }} />

// Good — spacing token via className
<div className="mt-4" />
```

---

## 11. Component Architecture

Components must be reusable, small, single-responsibility. Maximum 300 lines.

If larger, split into: component + hook + util.

---

## 12. Forbidden Design Patterns

Never:

- Random colors
- Random spacing
- Multiple design styles in one product
- Heavy shadows
- Too many animations
- Business logic inside UI
- Large components
- Inline CSS
- Duplicate components

---

## 13. AI Implementation Rules

Before creating UI:

1. Check existing components
2. Follow this DESIGN.md
3. Create reusable components
4. Mobile first
5. Dark mode support
6. Test responsive behavior

> CAUTION: Never ignore this document.

---

_Last Modified: 2026-07-04_
