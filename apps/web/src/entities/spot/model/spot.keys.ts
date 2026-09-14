import type { SpotListQuery } from "../api/spot.api";

export const spotKeys = {
  all: ["spots"] as const,
  // 쿼리별로 캐시를 나눈다. 홈은 레일마다, 안내 탭은 권역마다 다른 목록을 쓴다.
  list: (query: SpotListQuery = {}) => ["spots", "list", query] as const,
  detail: (slug: string) => ["spots", "detail", slug] as const,
};
