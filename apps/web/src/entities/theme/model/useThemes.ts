import { useQuery } from "@tanstack/react-query";

import { themeApi } from "../api/theme.api";
import { themeKeys } from "./theme.keys";

export function useThemes() {
  return useQuery({ queryKey: themeKeys.list(), queryFn: themeApi.list });
}

export function useTheme(slug: string) {
  return useQuery({
    queryKey: themeKeys.detail(slug),
    queryFn: () => themeApi.detail(slug),
  });
}
