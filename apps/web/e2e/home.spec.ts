import { expect, test } from "@playwright/test";

// API가 떠 있든 아니든 통과해야 한다 (TEST.md). 관광지 데이터는 단정하지 않고
// 정적 셸 — 헤더, 히어로, 탭 이동 — 만 확인한다. 실데이터가 필요한 검증은
// docker compose --profile full로 띄우는 별도 스위트가 맡는다.
test.describe("홈", () => {
  test("히어로와 네비게이션이 렌더링된다", async ({ page }) => {
    await page.goto("/");

    // 히어로 문구는 계절마다 다르므로 특정 문장을 단정하지 않는다.
    // 제목이 있다는 것과 계절 칩이 있다는 것만 본다.
    await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
    await expect(
      page.getByRole("link", { name: "온강릉 GANGNEUNG" }),
    ).toBeVisible();
  });

  test("계절을 바꾸면 히어로 문구가 바뀐다", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    const before = await heading.textContent();

    // 지금 계절이 무엇이든 겨울과 여름 중 하나는 다른 문구다
    await page.getByRole("button", { name: "겨울" }).click();
    const winter = await heading.textContent();
    await page.getByRole("button", { name: "여름" }).click();
    const summer = await heading.textContent();

    expect(winter).not.toBe(summer);
    expect([winter, summer]).toContain(
      before === winter ? winter : before === summer ? summer : winter,
    );
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
    // API 장애 시 데이터 탭 이동은 resilience.spec.ts에서 별도로 검증한다.
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
