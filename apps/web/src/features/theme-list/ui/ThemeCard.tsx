import Link from "next/link";

import type { Theme } from "@/entities/theme";

export function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <Link
      href={`/theme/${theme.slug}`}
      className="border-line bg-paper hover:border-sea/40 block rounded-[20px] border p-5 transition-colors"
    >
      <p className="text-muted text-[10.5px] font-bold tracking-[0.14em]">
        {theme.name_en}
      </p>
      <h3 className="font-display text-ink mt-2 text-[20px]">{theme.name}</h3>
      <p className="text-muted mt-2 text-[12.5px] leading-relaxed">
        {theme.tagline}
      </p>
      <div className="mt-4 flex flex-wrap gap-1">
        <span className="border-line text-muted rounded-full border px-2 py-0.5 text-[10.5px]">
          {theme.season}
        </span>
        <span className="border-line text-muted rounded-full border px-2 py-0.5 text-[10.5px]">
          {theme.car_note}
        </span>
      </div>
    </Link>
  );
}
