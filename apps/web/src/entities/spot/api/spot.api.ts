import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";

export type Spot = components["schemas"]["SpotRead"];
export type SpotDetail = components["schemas"]["SpotDetailRead"];
export type Zone = components["schemas"]["Zone"];
export type SpotCategory = components["schemas"]["SpotCategory"];
export type SpotSpan = components["schemas"]["SpotSpan"];
export type HomeRail = components["schemas"]["HomeRail"];

export type SpotListQuery = {
  rail?: HomeRail;
  zone?: Zone;
  category?: SpotCategory;
  limit?: number;
};

export const spotApi = {
  list: async (query: SpotListQuery = {}): Promise<Spot[]> => {
    const { data, error } = await apiClient.GET("/api/v1/spots", {
      params: { query },
    });
    if (error !== undefined)
      throw toApiError(error, "관광지 목록을 불러오지 못했습니다");
    return data;
  },

  detail: async (slug: string): Promise<SpotDetail> => {
    const { data, error } = await apiClient.GET("/api/v1/spots/{slug}", {
      params: { path: { slug } },
    });
    if (error !== undefined)
      throw toApiError(error, "관광지 정보를 불러오지 못했습니다");
    return data;
  },
};
