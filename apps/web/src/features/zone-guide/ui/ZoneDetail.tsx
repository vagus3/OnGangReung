import Link from "next/link";

import type { Spot } from "@/entities/spot";
import type { ZoneInfo } from "@/entities/zone";
import { CATEGORY_LABELS } from "@/entities/zone";
import { Card } from "@/shared/ui";

type ZoneDetailProps = {
  zone: ZoneInfo;
  spots: Spot[];
};

export function ZoneDetail({ zone, spots }: ZoneDetailProps) {
  return (
    <section className="px-4 py-8 sm:px-12" aria-label={`${zone.name} 안내`}>
      <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
        {zone.en}
      </p>
      <h2 className="font-display text-ink mt-2 text-[22px]">{zone.line}</h2>
      <p className="text-muted mt-3 max-w-[60ch] text-[13.5px] leading-relaxed">
        {zone.desc}
      </p>

      <h3 className="text-ink mt-8 text-[13.5px] font-bold">
        이 권역의 관광지
      </h3>
      {spots.length === 0 ? (
        <p className="text-muted mt-3 text-[12.5px]">
          아직 등록된 곳이 없습니다.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <li key={spot.slug}>
              <Card as="article">
                <Link href={`/spots/${spot.slug}`} className="block">
                  <p className="text-muted text-[10.5px] font-bold tracking-[0.12em]">
                    {CATEGORY_LABELS[spot.category]}
                  </p>
                  <h4 className="font-display text-ink mt-1 text-[17px]">
                    {spot.name}
                  </h4>
                  <p className="text-muted mt-2 text-[12.5px] leading-relaxed">
                    {spot.editorial_desc}
                  </p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
