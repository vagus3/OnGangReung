"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

import "leaflet/dist/leaflet.css";

import {
  boundsOf,
  markerColor,
  markerLabel,
  shouldDrawPath,
  usablePoints,
  type GeoMapMode,
  type GeoPoint,
} from "./markers";

type Props = {
  points: GeoPoint[];
  mode: GeoMapMode;
  accent?: string;
  label: string;
};

// 마커는 divIcon으로 만든다. 기본 핀 이미지를 쓰면 번들에 아이콘 에셋이
// 딸려오고 색·번호를 넣을 수 없다.
function iconFor(color: string, text: string): L.DivIcon {
  const inner =
    text === ""
      ? ""
      : `<span style="font-size:10px;font-weight:700;color:#fff;line-height:1">${text}</span>`;
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html:
      `<div style="width:22px;height:22px;border-radius:999px;background:${color};` +
      `display:flex;align-items:center;justify-content:center;` +
      `box-shadow:0 0 0 2px rgba(255,255,255,0.9)">${inner}</div>`,
  });
}

function popupFor(point: GeoPoint): string {
  const meta =
    point.meta === undefined
      ? ""
      : `<div style="font-size:10.5px;opacity:0.7">${point.meta}</div>`;
  const sub =
    point.sub === undefined
      ? ""
      : `<div style="font-size:11px;margin-top:2px">${point.sub}</div>`;
  return `<div style="font-weight:700;font-size:12.5px">${point.name}</div>${meta}${sub}`;
}

export function GeoMapCanvas({ points, mode, accent, label }: Props) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holder.current;
    if (el === null) return;

    const usable = usablePoints(points);
    const bounds = boundsOf(points);

    const map = L.map(el, {
      // 작은 카드 안에 들어가므로 기본 컨트롤을 줄인다
      zoomControl: usable.length > 1,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    usable.forEach((point, index) => {
      L.marker([point.lat, point.lng], {
        icon: iconFor(
          markerColor(mode, point, accent),
          markerLabel(mode, point, index),
        ),
        title: point.name,
      })
        .bindPopup(popupFor(point))
        .addTo(map);
    });

    if (shouldDrawPath(mode) && usable.length > 1) {
      L.polyline(
        usable.map((p) => [p.lat, p.lng] as [number, number]),
        {
          color: accent ?? "oklch(52% 0.115 232)",
          weight: 2,
          dashArray: "4 4",
        },
      ).addTo(map);
    }

    if (bounds === null) {
      map.setView([37.75, 128.9], 11); // 강릉 중심
    } else {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
    }

    return () => {
      map.remove();
    };
  }, [points, mode, accent]);

  return <div ref={holder} aria-label={label} className="h-full w-full" />;
}
