"use client";

import { useState } from "react";

import type { Spot } from "@/entities/spot";
import { ZONES } from "@/entities/zone";
import { Chip } from "@/shared/ui";

import { ZoneDetail } from "./ZoneDetail";

export function ZoneGuide({ spots }: { spots: Spot[] }) {
  const [selected, setSelected] = useState(ZONES[0].id);
  const zone = ZONES.find((entry) => entry.id === selected) ?? ZONES[0];

  return (
    <div>
      <ul
        className="scrollbar-none flex gap-2 overflow-x-auto px-4 sm:px-12"
        aria-label="권역 선택"
      >
        {ZONES.map((entry) => (
          <li key={entry.id}>
            <Chip
              selected={entry.id === selected}
              onClick={() => setSelected(entry.id)}
            >
              {entry.name}
            </Chip>
          </li>
        ))}
      </ul>

      <ZoneDetail
        zone={zone}
        spots={spots.filter((spot) => spot.zone === zone.id)}
      />
    </div>
  );
}
