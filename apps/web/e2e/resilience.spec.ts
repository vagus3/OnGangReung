import { expect, test } from "@playwright/test";

test("API 장애 중에도 모든 탭을 이동하고 실패한 요청을 재시도한다", async ({
  page,
}) => {
  let recover = false;
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({
      status: recover ? 200 : 503,
      contentType: "application/json",
      body: JSON.stringify(recover ? [] : { detail: "일시적인 장애" }),
    }),
  );
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "주요 메뉴" });
  await nav.getByRole("link", { name: "안내", exact: true }).click();
  await expect(page).toHaveURL(/\/info$/);
  await expect(
    page.getByRole("button", { name: "경포권", exact: true }),
  ).toBeVisible();
  await nav.getByRole("link", { name: "테마", exact: true }).click();
  await expect(page).toHaveURL(/\/theme$/);
  await expect(
    page.getByRole("button", { name: "다시 시도", exact: true }),
  ).toBeVisible();
  recover = true;
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.getByText("아직 등록된 테마가 없습니다.")).toBeVisible();
  await nav.getByRole("link", { name: "홈", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("후기 API 장애가 관광지와 축제 콘텐츠를 가리지 않는다", async ({
  page,
}) => {
  await page.route("**/api/v1/**", (route) =>
    route.fulfill({
      status: route.request().url().includes("reviews") ? 503 : 200,
      contentType: "application/json",
      body: route.request().url().includes("reviews")
        ? '{"detail":"장애"}'
        : "[]",
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "파도 소리를 기준으로 골라봐요" }),
  ).toBeVisible();
  await expect(page.getByText("후기를 불러오지 못했습니다.")).toBeVisible();
});

for (const width of [320, 390, 768, 1280]) {
  test(`${width}px 안내 화면은 가로로 넘치지 않는다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/v1/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.goto("/info");
    await expect(
      page.getByText("예시 날씨 · 실시간 예보 미연동"),
    ).toBeVisible();
    for (const mode of ["어둡게", "밝게"]) {
      await page.getByRole("radio", { name: mode }).click();
      if (width === 390 || width === 1280)
        await page.screenshot({
          path: `/tmp/ongangreung-info-${width}-${mode === "밝게" ? "light" : "dark"}.png`,
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
}
