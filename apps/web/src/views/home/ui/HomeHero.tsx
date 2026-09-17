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
    <section className="border-line border-b px-4 py-16 sm:px-12 sm:py-24">
      <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
        {season.eyebrow}
      </p>

      <h1 className="font-display text-ink mt-4 max-w-[18ch] text-[32px] leading-tight sm:text-[44px]">
        {season.titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <p className="text-muted mt-4 max-w-[44ch] text-[13.5px] leading-relaxed">
        {season.body}
      </p>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="계절">
        {SEASONS.map((item) => (
          <li key={item.id}>
            <Chip
              selected={item.id === seasonId}
              onClick={() => setSeasonId(item.id)}
            >
              {item.label}
            </Chip>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <p className="text-muted text-[10.5px] font-bold tracking-[0.14em]">
          이런 걸 많이 찾습니다
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {POPULAR.map((keyword) => (
            <li key={keyword}>
              {/* 검색이 없으므로 AI 코스로 보낸다 — 디자인도 같은 동선이다 */}
              <Link
                href="/ai"
                className="border-line text-muted hover:text-ink inline-flex h-9 items-center rounded-full border px-4 text-[12.5px]"
              >
                {keyword}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
