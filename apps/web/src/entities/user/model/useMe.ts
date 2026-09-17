import { useQuery } from "@tanstack/react-query";

import { userApi } from "../api/user.api";
import { userKeys } from "./user.keys";

/**
 * 현재 로그인한 사용자. 로그아웃 상태면 data가 null이다.
 *
 * 로그아웃은 오류가 아니라 정상 상태이므로 401을 null로 바꿔 받는다.
 * retry를 끄는 이유도 같다 — 재시도해도 결과가 달라지지 않는다.
 */
export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: userApi.me,
    retry: false,
    staleTime: 1000 * 60,
  });
}
