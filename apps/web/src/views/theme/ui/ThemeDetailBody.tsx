"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { themeApi, themeKeys } from "@/entities/theme";
import { ThemeEntryCard } from "@/features/theme-list";
import { GeoMap } from "@/shared/ui";

export function ThemeDetailBody({ slug }: { slug: string }) {
  const { data: theme } = useSuspenseQuery({
    queryKey: themeKeys.detail(slug),
    queryFn: () => themeApi.detail(slug),
  });

  return (
    <article className="px-4 pb-16 sm:px-12">
      <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
        {theme.name_en}
      </p>
      <h1 className="font-display text-ink mt-2 text-[30px] leading-tight">
        {theme.name}
      </h1>
      <p className="text-muted mt-3 text-[13.5px]">{theme.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="border-line text-muted rounded-full border px-3 py-1 text-[10.5px]">
          {theme.season}
        </span>
        <span className="border-line text-muted rounded-full border px-3 py-1 text-[10.5px]">
          {theme.car_note}
        </span>
      </div>

      <p className="text-ink mt-8 max-w-[60ch] text-[13.5px] leading-[1.9]">
        {theme.body}
      </p>

      {/* 코스는 도는 순서가 정보이므로 order 모드로 번호와 경로를 함께 그린다 */}
      <div className="mt-10">
        <GeoMap
          label={`${theme.name} 동선`}
          mode="order"
          height={320}
          points={theme.entries
            .filter((e) => e.spot.lat !== null && e.spot.lng !== null)
            .map((e, i) => ({
              name: e.spot.name,
              lat: e.spot.lat as number,
              lng: e.spot.lng as number,
              meta: String(i + 1),
              sub: e.hint ?? undefined,
            }))}
        />
      </div>

      <h2 className="text-ink mt-10 text-[13.5px] font-bold">
        도는 순서 {theme.entries.length > 0 && `· ${theme.entries.length}곳`}
      </h2>
      {theme.entries.length === 0 ? (
        <p className="text-muted mt-3 text-[12.5px]">
          장소를 준비하고 있습니다.
        </p>
      ) : (
        <ol className="mt-4 grid gap-3 lg:grid-cols-2">
          {theme.entries.map((entry, index) => (
            <li key={entry.spot.slug}>
              <ThemeEntryCard entry={entry} order={index + 1} />
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
