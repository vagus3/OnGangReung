import { QueryClient } from "@tanstack/react-query";

// 인스턴스 재사용(테스트/스토리북)을 위해 팩토리로 분리한다.
// 모듈 싱글턴으로 두면 서버 컴포넌트 렌더링 시 요청 간 캐시가 공유될 수 있어 피한다.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
