import Image from "next/image";
import Link from "next/link";

import type { Spot } from "@/entities/spot";
import { CATEGORY_LABELS } from "@/entities/zone";
import { Card } from "@/shared/ui";

// span은 편집자가 정하는 레이아웃 지시다. 카드 폭이 여기서 갈린다.
const WIDTH_BY_SPAN: Record<Spot["span"], string> = {
  std: "w-[280px] sm:w-[320px]",
  wide: "w-[320px] sm:w-[400px]",
  tall: "w-[280px] sm:w-[320px]",
};

export function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Card as="article" className="group border-0 bg-transparent p-0">
      <Link
        href={`/spots/${spot.slug}`}
        className={`block ${WIDTH_BY_SPAN[spot.span]}`}
      >
        <div className="spot-card-media bg-sand relative mb-4 aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_18px_50px_oklch(20%_0.04_250/0.12)] transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_28px_70px_oklch(20%_0.04_250/0.2)]">
          {spot.image_url !== null ? (
            <Image
              src={spot.image_url}
              alt=""
              fill
              sizes="360px"
              className="object-cover transition duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="text-muted flex h-full items-center justify-center text-[10.5px]">
              사진 준비 중
            </div>
          )}
          {spot.sticker !== null && (
            <span className="text-ink absolute top-2 left-2 rounded-full bg-[var(--surface-90)] px-3 py-1 text-[10.5px] font-bold">
              {spot.sticker}
            </span>
          )}
          <span className="spot-card-sheen" aria-hidden="true" />
        </div>

        <p className="text-muted text-[10.5px] font-bold tracking-[0.12em]">
          {CATEGORY_LABELS[spot.category]}
        </p>
        <h3 className="font-display text-ink mt-1 text-[22px]">{spot.name}</h3>
        <p className="text-muted mt-2 line-clamp-2 text-[12.5px] leading-relaxed">
          {spot.editorial_desc}
        </p>

        {spot.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1">
            {spot.tags.map((tag) => (
              <li
                key={tag}
                className="border-line text-muted rounded-full border px-2 py-0.5 text-[10.5px]"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </Card>
  );
}
