"use client";

import dynamic from "next/dynamic";

import {
  dayLegend,
  usablePoints,
  type GeoMapMode,
  type GeoPoint,
} from "./markers";

// Leaflet은 window에 의존하므로 서버에서 불러오면 죽는다.
const GeoMapCanvas = dynamic(
  () => import("./GeoMapCanvas").then((m) => m.GeoMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="bg-sand text-muted flex h-full items-center justify-center text-[11.5px]">
        지도를 불러오는 중입니다…
      </div>
    ),
  },
);

type GeoMapProps = {
  points: GeoPoint[];
  mode: GeoMapMode;
  accent?: string;
  /** 접근성 이름. 어느 지도인지 알려준다 */
  label: string;
  /** 디자인이 호출 지점마다 다른 높이를 준다 */
  height?: number;
};

export function GeoMap({
  points,
  mode,
  accent,
  label,
  height = 300,
}: GeoMapProps) {
  const usable = usablePoints(points);

  if (usable.length === 0) {
    return (
      <div
        style={{ height }}
        className="bg-sand text-muted flex items-center justify-center rounded-[16px] text-[11.5px]"
      >
        표시할 위치가 없습니다.
      </div>
    );
  }

  const legend = mode === "days" ? dayLegend(usable) : [];

  return (
    <div>
      <div
        style={{ height }}
        // isolation은 Leaflet의 z-index가 주변 sticky 요소를 뚫지 않게 한다
        className="relative isolate overflow-hidden rounded-[16px]"
      >
        <GeoMapCanvas
          points={usable}
          mode={mode}
          accent={accent}
          label={label}
        />
      </div>

      {legend.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-3">
          {legend.map((item) => (
            <li
              key={item.day}
              className="text-muted flex items-center gap-1.5 text-[10.5px]"
            >
              <span
                aria-hidden="true"
                className="inline-block size-2.5 rounded-full"
                style={{ background: item.color }}
              />
              DAY {item.day}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
