import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";

export type Review = components["schemas"]["ReviewRead"];
export type ReviewSummary = components["schemas"]["ReviewSummary"];

export const reviewApi = {
  summary: async (): Promise<ReviewSummary> => {
    const { data, error } = await apiClient.GET("/api/v1/reviews");
    if (error !== undefined)
      throw toApiError(error, "후기를 불러오지 못했습니다");
    return data;
  },
};

export const reviewKeys = {
  summary: ["reviews", "summary"] as const,
};
