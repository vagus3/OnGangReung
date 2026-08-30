import { defineConfig, devices } from "@playwright/test";

// dev 서버(3000)와 충돌하지 않도록 별도 포트를 쓴다.
const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // CI에서 test.only가 섞여 들어가면 나머지가 조용히 안 돌게 되므로 막는다
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // turbo의 test:e2e 태스크가 build에 의존하므로 여기서는 프로덕션 빌드를 띄운다.
  // next.config.ts의 output: "standalone" 때문에 next start가 경고를 내지만
  // 정상 동작한다. standalone 번들은 Docker 이미지 전용이다.
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
