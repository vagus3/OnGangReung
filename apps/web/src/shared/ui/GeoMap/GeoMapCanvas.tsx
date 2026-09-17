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
  const marker = document.createElement("div");
  marker.className = "map-marker";
  marker.style.backgroundColor = color;
  marker.textContent = text;
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: marker,
  });
}

function popupFor(point: GeoPoint): HTMLElement {
  const popup = document.createElement("div");
  for (const [value, className] of [
    [point.name, "map-popup-name"],
    [point.meta, "map-popup-meta"],
    [point.sub, "map-popup-sub"],
  ]) {
    if (value === undefined) continue;
    const row = document.createElement("div");
    row.className = className ?? "";
    row.textContent = value;
    popup.append(row);
  }
  return popup;
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
