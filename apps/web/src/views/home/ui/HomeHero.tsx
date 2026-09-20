"use client";

import Link from "next/link";
import { useState } from "react";

import { currentSeason, SEASONS } from "@/entities/content";
import { Chip } from "@/shared/ui";

// 인기 검색어는 아직 집계 기반이 없어 고정값이다. 검색이 붙으면 실제 집계로 바꾼다.
const POPULAR = [
  "정동진 일출",
  "안목 로스터리",
  "초당순두부",
  "안반데기 별",
  "월화거리 야경",
];

export function HomeHero() {
  // 첫 화면이 지금 계절로 열리는 편이 자연스럽다
  const [seasonId, setSeasonId] = useState(currentSeason);
  const season = SEASONS.find((s) => s.id === seasonId) ?? SEASONS[0];

  return (
    <section className="home-hero relative isolate min-h-[calc(100svh-4rem)] overflow-hidden text-white">
      <div className="hero-sky" aria-hidden="true" />
      <div className="hero-sun" aria-hidden="true" />
      <div className="hero-cloud hero-cloud-one" aria-hidden="true" />
      <div className="hero-cloud hero-cloud-two" aria-hidden="true" />
      <div className="hero-mountain" aria-hidden="true" />
      <div className="hero-sea" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="hero-shore" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1360px] flex-col justify-end px-4 py-10 sm:px-12 sm:py-14">
        <div className="animate-fade-up max-w-[760px]">
          <p className="text-[10.5px] font-bold tracking-[0.28em] text-white/75">
            {season.eyebrow}
          </p>
          <h1 className="font-display mt-4 text-[clamp(42px,7vw,76px)] leading-[1.07] tracking-[-0.035em] text-white">
            {season.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-[44ch] text-[13.5px] leading-[1.8] text-white/80 sm:text-[15px]">
            {season.body}
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-7 border-t border-white/25 pt-6 lg:flex-row lg:items-end">
          <div>
            <ul className="flex flex-wrap gap-2" aria-label="계절">
              {SEASONS.map((item) => (
                <li key={item.id}>
                  <Chip
                    selected={item.id === seasonId}
                    onClick={() => setSeasonId(item.id)}
                    className="border-white/35 bg-black/10 text-white backdrop-blur-md hover:bg-white/20"
                  >
                    {item.label}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:text-right">
            <p className="text-[10.5px] font-bold tracking-[0.18em] text-white/60">
              지금 많이 찾는 곳
            </p>
            <ul className="mt-3 flex max-w-[620px] flex-wrap gap-2 lg:justify-end">
              {POPULAR.map((keyword) => (
                <li key={keyword}>
                  <Link
                    href={`/ai?prompt=${encodeURIComponent(keyword)}`}
                    className="inline-flex h-9 items-center rounded-full border border-white/25 bg-black/10 px-4 text-[12px] text-white/85 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
                  >
                    {keyword}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-7 hidden items-center gap-3 text-[9px] tracking-[0.24em] text-white/55 sm:flex">
          <span>SCROLL</span>
          <span className="h-px w-12 bg-white/45" />
        </div>
      </div>
    </section>
  );
}
