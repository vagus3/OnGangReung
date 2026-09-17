import { describe, expect, it } from "vitest";

import {
  checkStamp,
  formatDistance,
  haversineMeters,
  STAMP_RADIUS_M,
} from "./distance";

describe("haversineMeters", () => {
  it("같은 점은 0m다", () => {
    expect(haversineMeters(37.8, 128.9, 37.8, 128.9)).toBe(0);
  });

  it("경포대와 오죽헌 사이가 대략 3km다", () => {
    // 실제 두 지점. 자릿수가 맞는지만 본다
    const d = haversineMeters(37.7956, 128.9107, 37.7844, 128.8783);
    expect(d).toBeGreaterThan(2000);
    expect(d).toBeLessThan(4000);
  });
});

describe("checkStamp", () => {
  const here = { lat: 37.8, lng: 128.9 };

  it("위치를 모르면 판정하지 않는다", () => {
    expect(checkStamp(null, { lat: 37.8, lng: 128.9 }).status).toBe(
      "no-location",
    );
  });

  it("장소에 좌표가 없어도 판정하지 않는다", () => {
    expect(checkStamp(here, { lat: null, lng: null }).status).toBe(
      "no-location",
    );
  });

  it("반경 안이면 찍을 수 있다", () => {
    expect(checkStamp(here, { lat: 37.8, lng: 128.9 }).status).toBe("ok");
  });

  it("반경 밖이면 못 찍는다", () => {
    // 위도 0.05도 ≈ 5.5km
    expect(checkStamp(here, { lat: 37.85, lng: 128.9 }).status).toBe("far");
  });

  it("경계 근처에서 반경 값을 지킨다", () => {
    const inside = checkStamp(here, { lat: 37.8 + 0.003, lng: 128.9 });
    expect(inside.status).toBe("ok");
    if (inside.status === "ok") {
      expect(inside.distance).toBeLessThanOrEqual(STAMP_RADIUS_M);
    }
  });
});

describe("formatDistance", () => {
  it("1km 미만은 m로", () => {
    expect(formatDistance(432.7)).toBe("433m");
  });

  it("1km 이상은 km로", () => {
    expect(formatDistance(2450)).toBe("2.5km");
  });
});
