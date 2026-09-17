"use client";

import Image from "next/image";
import { useSuspenseQuery } from "@tanstack/react-query";

import { spotApi, spotKeys } from "@/entities/spot";
import { CATEGORY_LABELS, findZone } from "@/entities/zone";
import { SaveButton } from "@/features/my-saves";
import { SpotFacts, SpotMenu } from "@/features/spot-detail";
import { GeoMap } from "@/shared/ui";

export function SpotDetailBody({ slug }: { slug: string }) {
  const { data: spot } = useSuspenseQuery({
    queryKey: spotKeys.detail(slug),
    queryFn: () => spotApi.detail(slug),
  });

  const zone = findZone(spot.zone);

  return (
    <article className="px-4 pb-16 sm:px-12">
      {spot.image_url !== null ? (
        <div className="bg-sand relative aspect-[16/9] overflow-hidden rounded-[24px]">
          <Image
            src={spot.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 1360px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        // 사진이 없을 때 16:9를 그대로 두면 빈 면이 화면을 통째로 잡는다.
        // 자리는 알리되 높이는 낮춘다.
        <div className="bg-sand text-muted flex h-28 items-center justify-center rounded-[24px] text-[11.5px]">
          사진 준비 중
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="border-line text-muted rounded-full border px-3 py-1 text-[10.5px] font-bold">
          {CATEGORY_LABELS[spot.category]}
        </span>
        {zone !== undefined && (
          <span className="border-line text-muted rounded-full border px-3 py-1 text-[10.5px]">
            {zone.name}
          </span>
        )}
        {spot.sticker !== null && (
          <span className="bg-sun/15 text-coffee rounded-full px-3 py-1 text-[10.5px] font-bold">
            {spot.sticker}
          </span>
        )}
      </div>

      <h1 className="font-display text-ink mt-3 text-[30px] leading-tight">
        {spot.name}
      </h1>
      {/* about은 editorial_desc를 첫 문장으로 포함하는 긴 판본이다.
          둘을 같이 쓰면 같은 문장이 두 번 나오므로 있는 쪽 하나만 쓴다. */}
      {spot.about !== null ? (
        <p className="text-ink mt-4 max-w-[60ch] text-[13.5px] leading-[1.9]">
          {spot.about}
        </p>
      ) : (
        <p className="text-muted mt-3 max-w-[52ch] text-[13.5px] leading-relaxed">
          {spot.editorial_desc}
        </p>
      )}

      <div className="mt-6">
        <SaveButton slug={spot.slug} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <SpotFacts spot={spot} />
          {spot.tip !== null && (
            <section className="bg-sand rounded-[20px] p-5">
              <h2 className="text-ink text-[11.5px] font-bold tracking-[0.1em]">
                알아두면 좋은 것
              </h2>
              <p className="text-muted mt-2 text-[12.5px] leading-relaxed">
                {spot.tip}
              </p>
            </section>
          )}
        </div>
        <div className="space-y-8">
          <SpotMenu menu={spot.menu} />
          {spot.lat !== null && spot.lng !== null && (
            <section>
              <h2 className="text-ink text-[13.5px] font-bold">위치</h2>
              <div className="mt-3">
                <GeoMap
                  label={`${spot.name} 위치`}
                  mode="single"
                  height={280}
                  points={[
                    {
                      name: spot.name,
                      lat: spot.lat,
                      lng: spot.lng,
                      meta: zone?.name,
                      sub: spot.address ?? undefined,
                    },
                  ]}
                />
              </div>
            </section>
          )}
        </div>
      </div>

      {spot.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2">
          {spot.tags.map((tag) => (
            <li
              key={tag}
              className="border-line text-muted rounded-full border px-3 py-1 text-[10.5px]"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
