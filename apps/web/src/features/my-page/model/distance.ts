/** 두 좌표 사이 거리(m). 스탬프 반경 판정에 쓴다. */
export function haversineMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 디자인이 정한 스탬프 반경. 이 안에 있어야 찍힌다. */
export const STAMP_RADIUS_M = 500;

export type StampCheck =
  | { status: "ok"; distance: number }
  | { status: "far"; distance: number }
  | { status: "no-location" };

export function checkStamp(
  here: { lat: number; lng: number } | null,
  target: { lat: number | null; lng: number | null },
): StampCheck {
  if (here === null || target.lat === null || target.lng === null) {
    return { status: "no-location" };
  }
  const distance = haversineMeters(here.lat, here.lng, target.lat, target.lng);
  return distance <= STAMP_RADIUS_M
    ? { status: "ok", distance }
    : { status: "far", distance };
}

/** 사람이 읽는 거리. 1km 넘으면 km로 바꾼다. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
