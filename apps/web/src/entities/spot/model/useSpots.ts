import { useQuery } from "@tanstack/react-query";

import { spotApi, type SpotListQuery } from "../api/spot.api";
import { spotKeys } from "./spot.keys";

// 훅이 entities에 있는 이유: spot-rail(홈)과 zone-guide(안내) 두 feature가
// 같은 도메인 데이터를 쓴다. 하나만 쓰면 해당 feature 안에 뒀을 것이다.
export function useSpots(query: SpotListQuery = {}) {
  return useQuery({
    queryKey: spotKeys.list(query),
    queryFn: () => spotApi.list(query),
  });
}

export function useSpot(slug: string) {
  return useQuery({
    queryKey: spotKeys.detail(slug),
    queryFn: () => spotApi.detail(slug),
  });
}
