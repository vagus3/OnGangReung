import type { Spot } from "@/entities/spot";
import { Rail, RailItem, SectionHeading } from "@/shared/ui";

import { SpotCard } from "./SpotCard";

type SpotRailProps = {
  eyebrow?: string;
  title: string;
  spots: Spot[];
  emptyMessage?: string;
};

export function SpotRail({
  eyebrow,
  title,
  spots,
  emptyMessage = "아직 등록된 곳이 없습니다.",
}: SpotRailProps) {
  return (
    <section className="py-10">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="mt-5">
        {spots.length === 0 ? (
          <p className="text-muted px-4 text-[12.5px] sm:px-12">
            {emptyMessage}
          </p>
        ) : (
          <Rail label={title}>
            {spots.map((spot) => (
              <RailItem key={spot.slug}>
                <SpotCard spot={spot} />
              </RailItem>
            ))}
          </Rail>
        )}
      </div>
    </section>
  );
}
