"use client";

import { useState } from "react";

import type { Festival } from "@/entities/festival";
import { GUIDE_SECTION_LABELS, GUIDE_ZONES } from "@/entities/guide";
import { FestivalRow } from "@/features/festival-list";
import { Chip } from "@/shared/ui";

import { useGuideScrollSpy } from "../model/useGuideScrollSpy";
import { GuideEats } from "./GuideEats";
import { GuideIndex } from "./GuideIndex";
import { GuideParking } from "./GuideParking";
import { GuideStays } from "./GuideStays";
import { GuideTransport } from "./GuideTransport";
import { GuideWeather } from "./GuideWeather";

export function ZoneGuide({ festivals }: { festivals: Festival[] }) {
  const [selected, setSelected] = useState(GUIDE_ZONES[0].id);
  const zone = GUIDE_ZONES.find((z) => z.id === selected) ?? GUIDE_ZONES[0];
  const { setRef, jump, activeIndex } = useGuideScrollSpy(
    GUIDE_SECTION_LABELS.length,
  );

  const zoneFestivals = festivals.filter((f) => f.zone === zone.id);

  const bodies = [
    <GuideWeather key="weather" />,
    <GuideTransport key="transport" zone={zone} />,
    <GuideStays key="stays" zone={zone} />,
    <GuideParking key="parking" zone={zone} />,
    <GuideEats key="eats" zone={zone} />,
    zoneFestivals.length === 0 ? (
      <p key="festival" className="text-muted text-[12.5px]">
        이 권역에 등록된 축제가 없습니다.
      </p>
    ) : (
      <div key="festival" className="border-line border-t">
        {zoneFestivals.map((festival) => (
          <FestivalRow key={festival.slug} festival={festival} />
        ))}
      </div>
    ),
  ];

  return (
    <div>
      <ul
        className="scrollbar-none flex gap-2 overflow-x-auto px-4 sm:px-12"
        aria-label="권역 선택"
      >
        {GUIDE_ZONES.map((entry) => (
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

      <div className="px-4 pt-8 sm:px-12">
        <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
          {zone.nameEn}
        </p>
        <h2 className="font-display text-ink mt-2 text-[22px]">{zone.line}</h2>
      </div>

      <div className="grid gap-10 px-4 py-8 sm:px-12 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div>
          {GUIDE_SECTION_LABELS.map((label, index) => (
            <section
              key={label}
              ref={setRef(index)}
              aria-label={label}
              className="scroll-mt-24 border-line border-t py-10 first:border-t-0 first:pt-0"
            >
              <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
                {String(index + 1).padStart(2, "0")} — {label.toUpperCase()}
              </p>
              <h3 className="font-display text-ink mt-2 mb-5 text-[20px]">
                {label}
              </h3>
              {bodies[index]}
            </section>
          ))}
        </div>

        <aside className="hidden lg:block">
          <GuideIndex activeIndex={activeIndex} onJump={jump} />
        </aside>
      </div>
    </div>
  );
}
