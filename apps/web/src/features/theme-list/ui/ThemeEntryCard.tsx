import Image from "next/image";
import Link from "next/link";

import type { ThemeEntry } from "@/entities/theme";
import { findZone } from "@/entities/zone";

// note는 이 테마 맥락의 서술이고 spot.editorial_desc는 장소 자체의 설명이다.
// 카드에서는 테마 맥락을 앞세운다 — 지금 보고 있는 것이 테마이기 때문이다.
export function ThemeEntryCard({
  entry,
  order,
}: {
  entry: ThemeEntry;
  order: number;
}) {
  const { spot, note, hint } = entry;
  const zone = findZone(spot.zone);

  return (
    <Link
      href={`/spots/${spot.slug}`}
      className="border-line bg-paper hover:border-sea/40 flex gap-4 rounded-[16px] border p-4 transition-colors"
    >
      <div className="bg-sand relative size-20 shrink-0 overflow-hidden rounded-[12px]">
        {spot.image_url !== null ? (
          <Image
            src={spot.image_url}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted flex h-full items-center justify-center text-[9.5px]">
            준비 중
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sea text-[10.5px] font-bold tabular-nums">
            {String(order).padStart(2, "0")}
          </span>
          {zone !== undefined && (
            <span className="text-muted text-[10.5px]">{zone.name}</span>
          )}
          {hint !== null && (
            <span className="bg-sand text-coffee rounded-full px-2 py-0.5 text-[10px]">
              {hint}
            </span>
          )}
        </div>
        <h3 className="font-display text-ink mt-1 text-[17px]">{spot.name}</h3>
        <p className="text-muted mt-1 text-[12.5px] leading-relaxed">{note}</p>
      </div>
    </Link>
  );
}
