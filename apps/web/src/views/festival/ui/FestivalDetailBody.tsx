"use client";

import { useQuery } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { GeoMap, QueryFeedback } from "@/shared/ui";

export function FestivalDetailBody({ slug }: { slug: string }) {
  const query = useQuery({
    queryKey: festivalKeys.detail(slug),
    queryFn: () => festivalApi.detail(slug),
  });

  if (!query.data) return <QueryFeedback label="축제 정보" query={query} />;
  const festival = query.data;

  const facts = [
    { label: "기간", value: festival.when_label },
    { label: "장소", value: festival.place },
    { label: "운영", value: festival.hours },
    { label: "요금", value: festival.price },
  ].filter(
    (row): row is { label: string; value: string } => row.value !== null,
  );

  return (
    <article className="px-4 pb-16 sm:px-12">
      <div className="flex flex-wrap items-center gap-2">
        {festival.badge !== null && (
          <span
            className={
              festival.is_now
                ? "bg-sun text-paper rounded-full px-3 py-1 text-[10.5px] font-bold"
                : "border-line text-muted rounded-full border px-3 py-1 text-[10.5px]"
            }
          >
            {festival.badge}
          </span>
        )}
        {festival.zone_label !== null && (
          <span className="border-line text-muted rounded-full border px-3 py-1 text-[10.5px]">
            {festival.zone_label}
          </span>
        )}
      </div>

      <h1 className="font-display text-ink mt-3 text-[30px] leading-tight">
        {festival.name}
      </h1>
      <p className="text-muted mt-3 text-[13.5px]">{festival.tagline}</p>

      <p className="text-ink mt-6 max-w-[60ch] text-[13.5px] leading-[1.9]">
        {festival.about}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <dl className="border-line divide-line divide-y border-y">
            {facts.map((row) => (
              <div key={row.label} className="flex gap-4 py-3">
                <dt className="text-muted w-14 shrink-0 text-[11.5px] font-bold">
                  {row.label}
                </dt>
                <dd className="text-ink m-0 text-[12.5px] leading-relaxed">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {festival.tip !== null && (
            <section className="bg-sand rounded-[20px] p-5">
              <h2 className="text-ink text-[11.5px] font-bold tracking-[0.1em]">
                알아두면 좋은 것
              </h2>
              <p className="text-muted mt-2 text-[12.5px] leading-relaxed">
                {festival.tip}
              </p>
            </section>
          )}
        </div>

        {festival.lat !== null && festival.lng !== null && (
          <section>
            <h2 className="text-ink text-[13.5px] font-bold">위치</h2>
            <div className="mt-3">
              <GeoMap
                label={`${festival.name} 위치`}
                mode="single"
                height={280}
                points={[
                  {
                    name: festival.name,
                    lat: festival.lat,
                    lng: festival.lng,
                    meta: festival.zone_label ?? undefined,
                    sub: festival.place,
                  },
                ]}
              />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
