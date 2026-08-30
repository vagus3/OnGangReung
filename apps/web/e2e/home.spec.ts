import { expect, test } from "@playwright/test";

test.describe("홈", () => {
  test("제목이 렌더링되고 posts로 이동한다", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "SHG Template",
    );

    await page.getByRole("link", { name: /Posts/ }).click();

    await expect(page).toHaveURL(/\/posts$/);
    await expect(
      page.getByRole("heading", { name: "Posts", level: 1 }),
    ).toBeVisible();
  });
});
