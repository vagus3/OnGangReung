export type GeoPoint = {
  name: string;
  lat: number;
  lng: number;
  /** 마커 옆 짧은 배지 (요금, 순번, 시각 등) */
  meta?: string;
  /** 보조 한 줄 */
  sub?: string;
  /** mode="fee" 전용 — '무료' | '유료' */
  fee?: string;
  /** mode="days" 전용 — 1부터 */
  day?: number;
};

export type GeoMapMode = "fee" | "days" | "order" | "single";

// 디자인의 주차장 범례 색. 무료/유료를 색으로만 구분하지 않도록
// 라벨(meta)도 함께 내보낸다.
export const FEE_FREE = "#2e7d4f";
export const FEE_PAID = "#d1782c";

// 일자별 색. 팔레트의 바다 → 노을 → 커피 순.
export const DAY_COLORS = [
  "oklch(52% 0.115 232)",
  "oklch(70% 0.175 45)",
  "oklch(44% 0.07 55)",
];

const DEFAULT_ACCENT = "oklch(52% 0.115 232)";

export function markerColor(
  mode: GeoMapMode,
  point: GeoPoint,
  accent?: string,
): string {
  if (mode === "fee") return point.fee === "무료" ? FEE_FREE : FEE_PAID;
  if (mode === "days") {
    const index = Math.max(1, point.day ?? 1) - 1;
    return DAY_COLORS[index % DAY_COLORS.length] ?? DEFAULT_ACCENT;
  }
  return accent ?? DEFAULT_ACCENT;
}

/** 마커 안에 찍히는 글자. order는 순번, 나머지는 없음. */
export function markerLabel(
  mode: GeoMapMode,
  point: GeoPoint,
  index: number,
): string {
  if (mode === "order") return String(index + 1);
  if (mode === "days") return String(point.day ?? 1);
  return "";
}

/** 순서가 의미를 갖는 모드에서만 경로선을 잇는다. */
export function shouldDrawPath(mode: GeoMapMode): boolean {
  return mode === "order";
}

/** 좌표가 없는 점은 지도에 올릴 수 없다. */
export function usablePoints(points: GeoPoint[]): GeoPoint[] {
  return points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

export type Bounds = [[number, number], [number, number]];

/**
 * 모든 점이 들어오는 사각형. 점이 하나뿐이면 Leaflet이 0 크기 bounds에
 * 과하게 확대하므로 약간 부풀린다.
 */
export function boundsOf(points: GeoPoint[]): Bounds | null {
  const usable = usablePoints(points);
  if (usable.length === 0) return null;

  const lats = usable.map((p) => p.lat);
  const lngs = usable.map((p) => p.lng);
  const pad = usable.length === 1 ? 0.01 : 0;

  return [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ];
}

/** mode="days"에서 쓰는 범례. 등장하는 일자만, 오름차순으로. */
export function dayLegend(
  points: GeoPoint[],
): { day: number; color: string }[] {
  const days = [...new Set(usablePoints(points).map((p) => p.day ?? 1))].sort(
    (a, b) => a - b,
  );
  return days.map((day) => ({
    day,
    color: DAY_COLORS[(day - 1) % DAY_COLORS.length] ?? DEFAULT_ACCENT,
  }));
}
