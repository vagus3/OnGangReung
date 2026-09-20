"use client";

import { useState } from "react";

import type { Festival } from "@/entities/festival";
import { GUIDE_SECTION_LABELS, GUIDE_ZONES } from "@/entities/guide";
import { FestivalRow } from "@/features/festival-list";
import { Chip } from "@/shared/ui";

import { useGuideScrollSpy } from "../model/useGuideScrollSpy";
import { GuideAccess } from "./GuideAccess";
import { GuideCenters } from "./GuideCenters";
import { GuideEats } from "./GuideEats";
import { GuideIndex } from "./GuideIndex";
import { GuideParking } from "./GuideParking";
import { GuidePhrases } from "./GuidePhrases";
import { GuideStays } from "./GuideStays";
import { GuideTransport } from "./GuideTransport";
import { GuideWeather } from "./GuideWeather";

export function ZoneGuide({
  festivals,
  festivalsUnavailable = false,
}: {
  festivals: Festival[];
  festivalsUnavailable?: boolean;
}) {
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
        {festivalsUnavailable
          ? "축제 정보를 불러오지 못했습니다."
          : "이 권역에 등록된 축제가 없습니다."}
      </p>
    ) : (
      <div key="festival" className="border-line border-t">
        {zoneFestivals.map((festival) => (
          <FestivalRow key={festival.slug} festival={festival} />
        ))}
      </div>
    ),
    <GuideCenters key="centers" />,
    <GuideAccess key="access" />,
    <GuidePhrases key="phrases" />,
  ];

  return (
    <div>
      <div className="guide-hero relative mx-4 mb-7 h-[360px] overflow-hidden rounded-[28px] border border-white/15 sm:mx-12 sm:h-[400px]">
        <div className="guide-contours" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-transparent" />
        <div
          className="absolute right-[8%] bottom-[-22%] h-[76%] w-[62%] rounded-[50%] bg-cyan-300/20 blur-sm"
          aria-hidden="true"
        />
        <div
          className="absolute right-[2%] bottom-[-36%] h-[80%] w-[76%] rounded-[50%] border-[28px] border-white/10"
          aria-hidden="true"
        />
        <div className="absolute inset-x-7 bottom-8 z-10 text-white sm:inset-x-10 sm:bottom-9">
          <p className="text-[10.5px] tracking-[0.28em] text-white/60">
            {zone.nameEn}
          </p>
          <h2 className="font-display mt-3 text-[clamp(34px,5vw,48px)]">
            {zone.name}
          </h2>
          <p className="mt-3 max-w-[560px] text-[13.5px] leading-[1.75] text-white/75">
            {zone.line}
          </p>
          <span className="mt-5 inline-flex rounded-full bg-white/90 px-4 py-2 text-[11.5px] font-bold text-slate-900">
            {zone.pick === "rent"
              ? "렌터카 추천 권역"
              : "대중교통으로 여행 가능"}
          </span>
        </div>
      </div>
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

      <div className="grid gap-10 px-4 py-8 sm:px-12 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div className="min-w-0">
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
              <h3 className="font-display text-ink mt-3 mb-7 text-[clamp(25px,3vw,36px)]">
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
