import Link from "next/link";

import { NIGHT_SPOTS } from "@/entities/content";

/** 홈 마감 섹션. 디자인은 별 캔버스를 깔지만 연출은 뒤로 미룬다. */
export function HomeNight() {
  return (
    <section className="bg-ink py-16">
      <div className="px-4 sm:px-12">
        <p className="text-paper/60 text-[10.5px] font-bold tracking-[0.2em]">
          AFTER DARK
        </p>
        <h2 className="font-display text-paper mt-2 text-[22px]">
          해가 지고 나서의 강릉
        </h2>
      </div>

      <ul className="mt-6 grid gap-3 px-4 sm:px-12 md:grid-cols-2 lg:grid-cols-4">
        {NIGHT_SPOTS.map((spot) => (
          <li
            key={spot.name}
            className="rounded-[20px] bg-[var(--surface-13)] p-5"
          >
            <p className="text-paper/60 text-[10.5px]">{spot.tag}</p>
            <p className="font-display text-paper mt-1.5 text-[17px]">
              {spot.name}
            </p>
            <p className="text-paper/70 mt-2 text-[12px] leading-relaxed">
              {spot.line}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-2 px-4 sm:px-12">
        <Link
          href="/theme"
          className="bg-paper text-ink inline-flex h-11 items-center rounded-[14px] px-4 text-[12.5px] font-bold"
        >
          테마로 둘러보기
        </Link>
        <Link
          href="/ai"
          className="inline-flex h-11 items-center rounded-[14px] border border-[var(--surface-30)] px-4 text-[12.5px] text-white"
        >
          AI로 코스 만들기
        </Link>
      </div>
    </section>
  );
}
