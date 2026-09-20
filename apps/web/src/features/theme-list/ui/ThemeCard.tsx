import Link from "next/link";

import type { Theme } from "@/entities/theme";

export function ThemeCard({
  theme,
  index = 0,
}: {
  theme: Theme;
  index?: number;
}) {
  const tone = ["theme-card-sea", "theme-card-earth", "theme-card-forest"][
    index % 3
  ];
  return (
    <Link
      href={`/theme/${theme.slug}`}
      className={`theme-card ${tone} group relative flex min-h-[380px] overflow-hidden rounded-[26px] border border-white/15 p-6 text-white shadow-[0_20px_55px_oklch(20%_0.04_250/0.15)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_32px_80px_oklch(20%_0.04_250/0.24)] sm:p-8`}
    >
      <span className="theme-card-orb" aria-hidden="true" />
      <span className="theme-card-lines" aria-hidden="true" />
      <span className="absolute top-6 right-7 font-display text-[56px] leading-none text-white/10 sm:top-8 sm:right-9">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative z-10 mt-auto">
        <p className="text-[10.5px] font-bold tracking-[0.2em] text-white/55">
          {theme.name_en}
        </p>
        <h3 className="font-display mt-3 text-[30px] text-white">
          {theme.name}
        </h3>
        <p className="mt-3 max-w-[28ch] text-[13px] leading-[1.75] text-white/68">
          {theme.tagline}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-black/10 px-3 py-1 text-[10.5px] text-white/70 backdrop-blur">
            {theme.season}
          </span>
          <span className="rounded-full border border-white/20 bg-black/10 px-3 py-1 text-[10.5px] text-white/70 backdrop-blur">
            {theme.car_note}
          </span>
          <span
            className="ml-auto text-[18px] transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
