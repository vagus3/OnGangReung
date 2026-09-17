import Link from "next/link";

import type { Festival } from "@/entities/festival";

// 진행 중인 축제를 색으로만 구분하지 않는다. 배지 문구가 상태를 말한다.
function badgeClass(festival: Festival): string {
  return festival.is_now
    ? "bg-sun text-paper"
    : "border-line text-muted border";
}

export function FestivalRow({ festival }: { festival: Festival }) {
  return (
    <Link
      href={`/festivals/${festival.slug}`}
      className="border-line hover:border-sea/40 grid grid-cols-[92px_1fr] items-baseline gap-4 border-b py-4 transition-colors sm:grid-cols-[110px_1fr_180px]"
    >
      <span className="text-muted text-[11.5px]">{festival.when_label}</span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-ink text-[17px]">
            {festival.name}
          </span>
          {festival.badge !== null && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass(festival)}`}
            >
              {festival.badge}
            </span>
          )}
        </span>
        <span className="text-muted mt-1 block text-[12.5px]">
          {festival.tagline}
        </span>
      </span>

      <span className="text-muted hidden text-[11.5px] sm:block">
        {festival.zone_label ?? ""} · {festival.place}
      </span>
    </Link>
  );
}
