# 006. 스타일링 레이어 도입 — Tailwind CSS v4 + oklch 디자인 토큰

날짜: 2026-09-14
상태: Accepted

## 배경 (Context)

이 레포에는 스타일링 레이어가 없다. CSS 파일이 한 개도 없고 화면은
`src/app/page.tsx`처럼 인라인 `style` 객체로만 그려져 있다. 템플릿 단계에서는
문제가 없었지만, 이제 완성된 디자인(강릉 관광 앱)을 구현해야 한다.

동시에 `.ai/rules/DESIGN.md`는 이미 Tailwind를 전제로 쓰여 있다. 10절이
`className="mt-4"`를 권장하고 인라인 `style`을 Bad 예시로 명시하며, 12절은
"Inline CSS"를 금지 패턴으로 올려두었다. 즉 문서와 코드가 어긋나 있고, 문서 쪽이
먼저 Tailwind를 가정하고 있었다.

구현할 디자인의 특성이 선택을 제약한다:

- 색이 전부 `oklch()`다. 라이트/다크 두 벌이 `:root` / `:root[data-theme="dark"]`로
  정의돼 있다
- 색 토큰 13개(`--c-ink` `--c-sea` `--c-sun` `--c-coffee` `--c-paper` `--c-sand`
  `--c-line` `--c-muted` `--c-nav` `--c-tint` `--c-chip` `--c-glow` `--c-solid`)
  외에 `--g13`…`--g94` 알파 스케일이 따로 있다
- 알파 스케일은 라이트에서 흰색(`oklch(100% 0 0 / a)`), 다크에서 어두운
  남색(`oklch(31% 0.022 258 / a)`)으로 **의미가 반전**한다. 단순 색이 아니라
  "현재 배경 위에 얹는 반투명 표면"이다
- 디스플레이 폰트가 세리프(`Song Myung`), 본문이 `IBM Plex Sans KR`로 분리돼 있다

## 선택지 (Options)

1. 인라인 `style` 객체 유지
   - 장점: 의존성 0. 디자인 HTML을 기계적으로 옮기기 가장 쉽다
   - 단점: DESIGN.md 10·12절과 정면으로 어긋난다. 다크 모드를 JS 분기로 처리하게
     되어 CSS 변수 한 줄로 끝날 일이 컴포넌트마다 조건문이 된다. 반응형을
     `matchMedia`로 다루게 된다

2. CSS Modules + CSS 변수
   - 장점: 표준에 가깝고 빌드 설정이 거의 없다. oklch 변수와 `data-theme` 전환이
     자연스럽다
   - 단점: DESIGN.md가 규정한 Tailwind 규칙(간격 토큰, 유틸리티 우선)을 강제할
     수단이 없다. 컴포넌트마다 `.module.css`가 생겨 파일 수가 두 배가 된다

3. Tailwind CSS v4
   - 장점: DESIGN.md가 이미 전제하는 도구다. v4는 CSS-first 설정이라
     `@theme`에 oklch 값을 그대로 적으면 유틸리티가 생성된다. 다크 모드는
     `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`로
     디자인의 `:root[data-theme="dark"]`와 1:1로 맞는다. 간격·반응형이 규칙화된다
   - 단점: 의존성 3개(`tailwindcss` `@tailwindcss/postcss` `postcss`)와 PostCSS
     설정이 추가된다. v3와 설정 방식이 달라 기존 지식이 그대로 통하지 않는다

4. Tailwind v3
   - 장점: 자료가 가장 많다
   - 단점: `tailwind.config.js`에 oklch 토큰을 JS 객체로 옮겨 적어야 해서 디자인의
     CSS 변수 구조와 이중화된다. 신규 도입에 구버전을 고를 이유가 없다

## 결정 (Decision)

Tailwind CSS v4를 도입한다.

이유:

- DESIGN.md가 이미 Tailwind를 전제하고 있어, 도입이 새 규칙을 만드는 게 아니라
  문서와 코드의 어긋남을 없애는 방향이다
- v4의 `@theme`가 oklch를 그대로 받으므로 디자인 토큰을 변환 없이 옮긴다.
  값이 한 곳(CSS)에만 존재해 디자인과 코드가 갈라지지 않는다
- `@custom-variant`의 속성 선택자 방식이 디자인의 `data-theme` 구조와 정확히
  일치한다. 테마 전환이 루트 속성 하나로 끝난다

### 토큰 배치 규칙

색·폰트 토큰은 `@theme`에 둔다. `--g*` 알파 스케일은 `@theme` **밖**의 평범한
커스텀 프로퍼티로 둔다.

`@theme`는 정적인 디자인 토큰을 선언해 유틸리티 클래스를 생성하는 자리다. `--g*`는
테마에 따라 색상 자체가 바뀌는(흰색 ↔ 남색) 문맥 의존 값이라 이 모델에 맞지 않는다.
`:root`와 `[data-theme="dark"]` 블록에서 각각 정의하고 소비 지점에서 변수로 참조한다.

## 결과 (Consequences)

- 긍정적: DESIGN.md 10·12절이 실제로 강제된다. 다크 모드가 루트 속성 하나로
  동작한다. 디자인 토큰이 CSS 한 곳에만 존재한다
- 부정적: 의존성과 PostCSS 설정이 늘어난다. `apps/web/postcss.config.mjs`가
  새로 생긴다. lint-staged에 `*.css` 항목이 없어 CSS 파일이 포맷 대상에서
  빠져 있었으므로 함께 보완해야 한다
- 향후 고려사항:
  - `.ai/rules/DESIGN.md`의 색·폰트 규정은 이 디자인과 충돌하므로 별도로 재작성한다
    (보라 브랜드 `#8B5CF6` + Dark Mode First + Inter/Pretendard → oklch 팔레트 +
    라이트 우선 + Song Myung/IBM Plex Sans KR). 8px 간격 체계, 컴포넌트 300줄 제한,
    WCAG AA, 금지 패턴 목록은 충돌하지 않으므로 유지한다
  - `.ai/STACK.md` §2에 Tailwind 행을 추가한다. 이 파일이 스택 버전의 단일 소스다
  - 디자인에는 `@keyframes`가 40개 가까이 있다. 전부 옮기지 않고 실제로 쓰는
    것만 `globals.css`에 넣는다. DESIGN.md 7절의 "불필요한 모션 지양"과 같은 방향이다
