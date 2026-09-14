import { describe, expect, it } from "vitest";

import { isActiveTab, NAV_TABS } from "./tabs";

describe("NAV_TABS", () => {
  it("DESIGN.md 제한대로 5개를 넘지 않는다", () => {
    expect(NAV_TABS.length).toBeLessThanOrEqual(5);
  });

  it("href가 중복되지 않는다", () => {
    expect(new Set(NAV_TABS.map((t) => t.href)).size).toBe(NAV_TABS.length);
  });
});

describe("isActiveTab", () => {
  it("홈은 정확히 일치할 때만 활성이다", () => {
    // "/"를 startsWith로 보면 모든 경로에서 홈이 활성이 된다
    expect(isActiveTab("/", "/")).toBe(true);
    expect(isActiveTab("/info", "/")).toBe(false);
  });

  it("하위 경로에서도 상위 탭이 활성이다", () => {
    expect(isActiveTab("/info", "/info")).toBe(true);
    expect(isActiveTab("/info/gyeongpo", "/info")).toBe(true);
  });

  it("접두사만 겹치는 다른 경로는 활성이 아니다", () => {
    expect(isActiveTab("/information", "/info")).toBe(false);
  });
});
