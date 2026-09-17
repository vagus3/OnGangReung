import { describe, expect, it } from "vitest";

import {
  boundsOf,
  dayLegend,
  FEE_FREE,
  FEE_PAID,
  markerColor,
  markerLabel,
  shouldDrawPath,
  usablePoints,
  type GeoPoint,
} from "./markers";

const point = (over: Partial<GeoPoint> = {}): GeoPoint => ({
  name: "경포대",
  lat: 37.8,
  lng: 128.9,
  ...over,
});

describe("markerColor", () => {
  it("fee 모드는 무료와 유료를 다른 색으로 준다", () => {
    expect(markerColor("fee", point({ fee: "무료" }))).toBe(FEE_FREE);
    expect(markerColor("fee", point({ fee: "유료" }))).toBe(FEE_PAID);
  });

  it("fee가 없으면 유료로 본다", () => {
    // 요금 정보가 빠졌을 때 무료로 보이면 사용자를 오해시킨다
    expect(markerColor("fee", point())).toBe(FEE_PAID);
  });

  it("days 모드는 일자마다 색이 다르다", () => {
    const day1 = markerColor("days", point({ day: 1 }));
    const day2 = markerColor("days", point({ day: 2 }));

    expect(day1).not.toBe(day2);
  });

  it("일자가 색 개수를 넘으면 처음으로 돌아간다", () => {
    expect(markerColor("days", point({ day: 4 }))).toBe(
      markerColor("days", point({ day: 1 })),
    );
  });

  it("order 모드는 accent를 따른다", () => {
    expect(markerColor("order", point(), "#ff0000")).toBe("#ff0000");
  });
});

describe("markerLabel", () => {
  it("order는 1부터 매긴 순번을 찍는다", () => {
    expect(markerLabel("order", point(), 0)).toBe("1");
    expect(markerLabel("order", point(), 2)).toBe("3");
  });

  it("days는 일자를 찍는다", () => {
    expect(markerLabel("days", point({ day: 2 }), 5)).toBe("2");
  });

  it("single과 fee는 글자를 넣지 않는다", () => {
    expect(markerLabel("single", point(), 0)).toBe("");
    expect(markerLabel("fee", point(), 0)).toBe("");
  });
});

describe("shouldDrawPath", () => {
  it("순서가 의미 있는 모드에서만 선을 잇는다", () => {
    expect(shouldDrawPath("order")).toBe(true);
    expect(shouldDrawPath("days")).toBe(false);
    expect(shouldDrawPath("fee")).toBe(false);
    expect(shouldDrawPath("single")).toBe(false);
  });
});

describe("usablePoints", () => {
  it("좌표가 없는 점을 걸러낸다", () => {
    const points = [
      point(),
      { name: "좌표없음", lat: Number.NaN, lng: Number.NaN },
    ];

    expect(usablePoints(points)).toHaveLength(1);
  });
});

describe("boundsOf", () => {
  it("점이 없으면 null", () => {
    expect(boundsOf([])).toBeNull();
  });

  it("모든 점을 감싼다", () => {
    const bounds = boundsOf([
      point({ lat: 37.7, lng: 128.8 }),
      point({ lat: 37.9, lng: 129.0 }),
    ]);

    expect(bounds).toEqual([
      [37.7, 128.8],
      [37.9, 129.0],
    ]);
  });

  it("점이 하나면 사각형을 부풀린다", () => {
    // 0 크기 bounds면 Leaflet이 최대 배율로 확대해버린다
    const bounds = boundsOf([point({ lat: 37.8, lng: 128.9 })]);

    expect(bounds).not.toBeNull();
    expect(bounds?.[0][0]).toBeLessThan(37.8);
    expect(bounds?.[1][0]).toBeGreaterThan(37.8);
  });
});

describe("dayLegend", () => {
  it("등장하는 일자만 오름차순으로 준다", () => {
    const legend = dayLegend([
      point({ day: 2 }),
      point({ day: 1 }),
      point({ day: 2 }),
    ]);

    expect(legend.map((l) => l.day)).toEqual([1, 2]);
  });

  it("일자가 없으면 1로 본다", () => {
    expect(dayLegend([point()]).map((l) => l.day)).toEqual([1]);
  });
});
