import { expect, test } from "@playwright/test";

// 백엔드가 떠 있든 아니든 통과해야 하는 것만 검증한다.
// 목록 데이터까지 확인하는 E2E는 docker compose --profile full로 API와 DB를
// 함께 띄운 뒤 별도 스펙으로 추가한다.
test.describe("/posts", () => {
  test("작성 폼이 렌더링된다", async ({ page }) => {
    await page.goto("/posts");

    await expect(
      page.getByRole("heading", { name: "Posts", level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel("제목")).toBeVisible();
    await expect(page.getByLabel("내용")).toBeVisible();
    await expect(page.getByRole("button", { name: "작성" })).toBeVisible();
  });

  // 하이드레이션이 실제로 끝났는지 확인하는 테스트 — 서버 렌더링만으로는
  // react-hook-form의 검증이 동작하지 않는다.
  test("빈 폼을 제출하면 필수 입력 오류가 뜬다", async ({ page }) => {
    await page.goto("/posts");

    await page.getByRole("button", { name: "작성" }).click();

    await expect(page.getByText("제목을 입력하세요")).toBeVisible();
    await expect(page.getByText("내용을 입력하세요")).toBeVisible();
  });
});
