import Link from "next/link";

import { NIGHT_SPOTS } from "@/entities/content";

// 고정 야간색. bg-ink 같은 토큰을 쓰면 다크 모드에서 뒤집혀 이 섹션만 밝은
// 패널이 된다 — 디자인도 여기는 고정색을 쓴다.
const NIGHT_BG = "oklch(14% 0.035 258)";

/** 홈 마감 섹션. 디자인은 별 캔버스를 깔지만 연출은 뒤로 미룬다. */
export function HomeNight() {
  return (
    <section className="py-16" style={{ background: NIGHT_BG }}>
      <div className="px-4 sm:px-12">
        <p className="text-[10.5px] font-bold tracking-[0.2em] text-white/60">
          AFTER DARK
        </p>
        <h2 className="font-display mt-2 text-[22px] text-white">
          해가 지고 나서의 강릉
        </h2>
      </div>

      <ul className="mt-6 grid gap-3 px-4 sm:px-12 md:grid-cols-2 lg:grid-cols-4">
        {NIGHT_SPOTS.map((spot) => (
          <li key={spot.name} className="rounded-[20px] bg-white/10 p-5">
            <p className="text-[10.5px] text-white/60">{spot.tag}</p>
            <p className="font-display mt-1.5 text-[17px] text-white">
              {spot.name}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/70">
              {spot.line}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-2 px-4 sm:px-12">
        <Link
          href="/theme"
          className="inline-flex h-11 items-center rounded-[14px] bg-white px-4 text-[12.5px] font-bold text-[oklch(14%_0.035_258)]"
        >
          테마로 둘러보기
        </Link>
        <Link
          href="/ai"
          className="inline-flex h-11 items-center rounded-[14px] border border-white/30 px-4 text-[12.5px] text-white"
        >
          AI로 코스 만들기
        </Link>
      </div>
    </section>
  );
}
