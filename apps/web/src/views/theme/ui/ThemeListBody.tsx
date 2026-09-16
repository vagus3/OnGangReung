"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { themeApi, themeKeys } from "@/entities/theme";
import { ThemeCard } from "@/features/theme-list";

export function ThemeListBody() {
  const { data: themes } = useSuspenseQuery({
    queryKey: themeKeys.list(),
    queryFn: themeApi.list,
  });

  if (themes.length === 0) {
    return (
      <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
        아직 등록된 테마가 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 px-4 py-8 sm:grid-cols-2 sm:px-12 lg:grid-cols-3">
      {themes.map((theme) => (
        <li key={theme.slug}>
          <ThemeCard theme={theme} />
        </li>
      ))}
    </ul>
  );
}
