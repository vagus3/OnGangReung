import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";

export type Theme = components["schemas"]["ThemeRead"];
export type ThemeDetail = components["schemas"]["ThemeDetailRead"];
export type ThemeEntry = components["schemas"]["ThemeEntryRead"];

export const themeApi = {
  list: async (): Promise<Theme[]> => {
    const { data, error } = await apiClient.GET("/api/v1/themes");
    if (error !== undefined)
      throw toApiError(error, "테마 목록을 불러오지 못했습니다");
    return data;
  },

  detail: async (slug: string): Promise<ThemeDetail> => {
    const { data, error } = await apiClient.GET("/api/v1/themes/{slug}", {
      params: { path: { slug } },
    });
    if (error !== undefined)
      throw toApiError(error, "테마 정보를 불러오지 못했습니다");
    return data;
  },
};
