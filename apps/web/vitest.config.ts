import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // globals가 있어야 @testing-library/react의 afterEach 자동 cleanup이 등록된다
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // E2E는 Playwright가 담당한다 — vitest가 e2e/를 집어가지 않도록 제외
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // 재export만 하는 슬라이스 공개 API — 단위 테스트 대상이 아니다
        "src/**/index.ts",
        // Next.js App Router 진입점 — 단위 테스트가 아니라 E2E가 담당
        "src/app/**",
      ],
      // 현재 수준을 바닥으로 고정해 하락을 막는 래칫.
      // 테스트가 늘면 이 숫자를 올린다. 목표는 TEST.md의 Integration 60%.
      thresholds: {
        lines: 30,
        functions: 45,
        branches: 55,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
