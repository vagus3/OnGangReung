import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";
import type { Zone } from "@/entities/spot";

export type Festival = components["schemas"]["FestivalRead"];
export type FestivalDetail = components["schemas"]["FestivalDetailRead"];

export const festivalApi = {
  list: async (zone?: Zone): Promise<Festival[]> => {
    const { data, error } = await apiClient.GET("/api/v1/festivals", {
      params: { query: zone === undefined ? {} : { zone } },
    });
    if (error !== undefined)
      throw toApiError(error, "축제 목록을 불러오지 못했습니다");
    return data;
  },

  detail: async (slug: string): Promise<FestivalDetail> => {
    const { data, error } = await apiClient.GET("/api/v1/festivals/{slug}", {
      params: { path: { slug } },
    });
    if (error !== undefined)
      throw toApiError(error, "축제 정보를 불러오지 못했습니다");
    return data;
  },
};
