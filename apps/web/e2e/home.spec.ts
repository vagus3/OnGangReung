import { expect, test } from "@playwright/test";

// API가 떠 있든 아니든 통과해야 한다 (TEST.md). 관광지 데이터는 단정하지 않고
// 정적 셸 — 헤더, 히어로, 탭 이동 — 만 확인한다. 실데이터가 필요한 검증은
// docker compose --profile full로 띄우는 별도 스위트가 맡는다.
test.describe("홈", () => {
  test("히어로와 네비게이션이 렌더링된다", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "바다와 커피",
    );
    await expect(
      page.getByRole("link", { name: "온강릉 GANGNEUNG" }),
    ).toBeVisible();
  });

  test("화면 모드를 바꾸면 루트 속성이 따라 바뀐다", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("radio", { name: "어둡게" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("radio", { name: "시스템" }).click();
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      "dark",
    );
  });

  test("데스크톱 네비게이션이 모든 탭을 올바른 경로로 잇는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "주요 메뉴" });
    for (const [label, href] of [
      ["홈", "/"],
      ["안내", "/info"],
      ["AI 코스", "/ai"],
      ["테마", "/theme"],
      ["마이페이지", "/my"],
    ] as const) {
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  test("모바일에서는 하단 탭바가 대신 보인다", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(
      page.getByRole("navigation", { name: "하단 메뉴" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "주요 메뉴" }),
    ).toBeHidden();
  });

  test("탭을 눌러 이동한다", async ({ page }) => {
    // 데이터를 가져오지 않는 탭으로 확인한다. API가 내려간 상태에서 데이터를
    // 읽는 탭으로 클릭 전환하면 useSuspenseQuery가 전환 중 던진 오류를 React가
    // 전환 폐기로 처리해 이동이 일어나지 않는다 (CHANGELOG의 Known Issues).
    // API가 살아 있으면 모든 탭에서 정상 동작하며, 그 검증은
    // docker compose --profile full로 띄우는 별도 스위트가 맡는다 (TEST.md).
    //
    // 남은 정적 탭이 /ai, /my 둘뿐이므로 이 탭들이 채워지면 이 테스트는
    // href 단정으로 합치거나 전체 스위트를 API 기동 전제로 옮겨야 한다.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "주요 메뉴" })
      .getByRole("link", { name: "AI 코스" })
      .click();

    await expect(page).toHaveURL(/\/ai$/);
  });

  test("안내 탭이 API 없이도 렌더링된다", async ({ page }) => {
    await page.goto("/info");

    await expect(page.getByRole("heading", { level: 2 }).first()).toContainText(
      "어느 권역부터",
    );
  });
});
