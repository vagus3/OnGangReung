import { describe, expect, it } from "vitest";

import { currentSeason, NIGHT_SPOTS, SEASONS } from "./season.const";

describe("SEASONS", () => {
  it("네 계절이 있다", () => {
    expect(SEASONS).toHaveLength(4);
  });

  it("제목이 여러 줄로 나뉘어 있다", () => {
    // 디자인은 <br />로 줄을 나눈다. 배열로 받아 컴포넌트가 나눈다.
    for (const season of SEASONS) {
      expect(season.titleLines.length).toBeGreaterThan(0);
      expect(season.titleLines.every((line) => line.trim() !== "")).toBe(true);
    }
  });
});

describe("currentSeason", () => {
  it("월로 계절을 고른다", () => {
    expect(currentSeason(new Date("2026-04-15"))).toBe("spring");
    expect(currentSeason(new Date("2026-07-15"))).toBe("summer");
    expect(currentSeason(new Date("2026-10-15"))).toBe("autumn");
    expect(currentSeason(new Date("2026-01-15"))).toBe("winter");
  });

  it("12월과 2월도 겨울이다", () => {
    // 겨울만 해를 넘기므로 경계를 확인한다
    expect(currentSeason(new Date("2026-12-31"))).toBe("winter");
    expect(currentSeason(new Date("2026-02-01"))).toBe("winter");
  });

  it("고른 계절이 SEASONS에 실제로 있다", () => {
    const ids = new Set(SEASONS.map((s) => s.id));
    for (const month of [1, 3, 6, 9, 12]) {
      expect(ids.has(currentSeason(new Date(2026, month - 1, 15)))).toBe(true);
    }
  });
});

describe("NIGHT_SPOTS", () => {
  it("네 곳이 모두 문구를 갖는다", () => {
    expect(NIGHT_SPOTS).toHaveLength(4);
    for (const spot of NIGHT_SPOTS) {
      expect(spot.name).not.toBe("");
      expect(spot.line).not.toBe("");
      expect(spot.tag).not.toBe("");
    }
  });
});
