import Image from "next/image";

import type { Spot } from "@/entities/spot";
import { CATEGORY_LABELS } from "@/entities/zone";
import { Card } from "@/shared/ui";

// span은 편집자가 정하는 레이아웃 지시다. 카드 폭이 여기서 갈린다.
const WIDTH_BY_SPAN: Record<Spot["span"], string> = {
  std: "w-[260px]",
  wide: "w-[360px]",
  tall: "w-[260px]",
};

export function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Card as="article">
      <div className={WIDTH_BY_SPAN[spot.span]}>
        <div className="bg-sand relative mb-3 aspect-[4/3] overflow-hidden rounded-[16px]">
          {spot.image_url !== null ? (
            <Image
              src={spot.image_url}
              alt=""
              fill
              sizes="360px"
              className="object-cover"
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
        </div>

        <p className="text-muted text-[10.5px] font-bold tracking-[0.12em]">
          {CATEGORY_LABELS[spot.category]}
        </p>
        <h3 className="font-display text-ink mt-1 text-[17px]">{spot.name}</h3>
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
      </div>
    </Card>
  );
}
