import { expect, test } from "@playwright/test";

// API 유무와 무관하게 통과해야 한다 (TEST.md). 테마 데이터는 단정하지 않고
// 화면이 열리는지와 셸이 그려지는지만 확인한다.
test.describe("테마", () => {
  test("목록 화면이 열린다", async ({ page }) => {
    await page.goto("/theme");

    await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
      "무엇을 보러",
    );
  });

  test("데이터가 없어도 안내 문구나 목록 중 하나가 나온다", async ({
    page,
  }) => {
    await page.goto("/theme");

    // API가 죽어 있으면 오류 문구, 살아 있으면 목록이 뜬다. 둘 다 정상 상태다.
    await expect(
      page.locator("main").filter({ hasText: /테마|불러오지 못했습니다/ }),
    ).toBeVisible();
  });

  test("없는 테마 slug도 화면이 깨지지 않는다", async ({ page }) => {
    await page.goto("/theme/존재하지-않음");

    await expect(page.getByRole("link", { name: "← 테마 목록" })).toBeVisible();
  });

  test("장소 상세 화면이 열린다", async ({ page }) => {
    await page.goto("/spots/spot_gyeongpo");

    await expect(page.getByRole("link", { name: "← 돌아가기" })).toBeVisible();
  });
});
