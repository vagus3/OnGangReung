import { describe, expect, it } from "vitest";

import { CATEGORY_LABELS, findZone, ZONES } from "./zone.const";

describe("ZONES", () => {
  it("권역은 5개다", () => {
    expect(ZONES).toHaveLength(5);
  });

  it("id가 중복되지 않는다", () => {
    expect(new Set(ZONES.map((z) => z.id)).size).toBe(ZONES.length);
  });

  it("모든 권역이 표시 문구를 갖는다", () => {
    for (const zone of ZONES) {
      expect(zone.name).not.toBe("");
      expect(zone.line).not.toBe("");
      expect(zone.desc).not.toBe("");
    }
  });
});

describe("findZone", () => {
  it("id로 권역을 찾는다", () => {
    expect(findZone("gyeongpo")?.name).toBe("경포권");
  });

  it("없는 id면 undefined", () => {
    // @ts-expect-error 런타임 방어를 확인한다
    expect(findZone("없음")).toBeUndefined();
  });
});

describe("CATEGORY_LABELS", () => {
  it("모든 카테고리에 한글 라벨이 있다", () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(5);
    expect(CATEGORY_LABELS.nature).toBe("자연");
  });
});
