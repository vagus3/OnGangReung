"use client";

import { useQuery } from "@tanstack/react-query";

import { themeApi, themeKeys } from "@/entities/theme";
import { QueryFeedback } from "@/shared/ui";
import { ThemeCard } from "@/features/theme-list";

export function ThemeListBody() {
  const query = useQuery({
    queryKey: themeKeys.list(),
    queryFn: themeApi.list,
  });

  if (!query.data) return <QueryFeedback label="테마 정보" query={query} />;
  const themes = query.data;

  if (themes.length === 0) {
    return (
      <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
        아직 등록된 테마가 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-5 px-4 py-10 sm:grid-cols-2 sm:px-12 lg:grid-cols-3 lg:py-16">
      {themes.map((theme, index) => (
        <li key={theme.slug}>
          <ThemeCard theme={theme} index={index} />
        </li>
      ))}
    </ul>
  );
}
