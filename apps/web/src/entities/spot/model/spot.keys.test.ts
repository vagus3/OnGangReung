import { describe, expect, it } from "vitest";

import { spotKeys } from "./spot.keys";

describe("spotKeys", () => {
  it("쿼리가 다르면 캐시 키가 갈린다", () => {
    // 홈은 레일마다, 안내 탭은 권역마다 다른 목록을 쓴다.
    // 키가 같으면 서로의 결과를 덮어쓴다.
    const beach = JSON.stringify(spotKeys.list({ rail: "beach" }));
    const food = JSON.stringify(spotKeys.list({ rail: "food" }));

    expect(beach).not.toBe(food);
  });

  it("같은 쿼리는 같은 키를 만든다", () => {
    expect(JSON.stringify(spotKeys.list({ zone: "gyeongpo" }))).toBe(
      JSON.stringify(spotKeys.list({ zone: "gyeongpo" })),
    );
  });

  it("목록과 상세가 all 아래로 묶인다", () => {
    // 전체 무효화가 한 번에 되도록 접두사를 공유한다
    expect(spotKeys.list()[0]).toBe(spotKeys.all[0]);
    expect(spotKeys.detail("x")[0]).toBe(spotKeys.all[0]);
  });

  it("slug가 다르면 상세 키가 갈린다", () => {
    expect(spotKeys.detail("a")).not.toEqual(spotKeys.detail("b"));
  });
});
