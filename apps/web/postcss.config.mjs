// Tailwind v4는 전용 PostCSS 플러그인 하나로 동작한다.
// v3의 tailwindcss/autoprefixer 조합이 아니다 — 토큰 설정은 CSS(@theme)에 있다.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
