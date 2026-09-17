import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { reviewApi, reviewKeys } from "@/entities/review";
import { spotApi, spotKeys } from "@/entities/spot";
import { createQueryClient } from "@/shared/api";
import { HomePage } from "@/views/home";

// 요청 시점의 API 데이터에 의존한다. 기본값(정적 프리렌더)이면 빌드 때 API를
// 호출하고, API가 없는 환경(CI 포함)에서 빌드가 통째로 깨진다.
export const dynamic = "force-dynamic";

export default async function Page() {
  const queryClient = createQueryClient();
  // 프리페치 실패가 페이지 렌더링을 막으면 안 된다. API가 죽었을 때 탭 전환이
  // 아무 반응 없이 멈추는 문제가 실제로 났다. 실패하면 비운 채로 넘기고
  // 클라이언트의 ErrorBoundary가 사용자에게 상태를 알린다.
  try {
    await queryClient.prefetchQuery({
      queryKey: spotKeys.list({ limit: 100 }),
      queryFn: () => spotApi.list({ limit: 100 }),
    });
    await queryClient.prefetchQuery({
      queryKey: festivalKeys.list(),
      queryFn: () => festivalApi.list(),
    });
    await queryClient.prefetchQuery({
      queryKey: reviewKeys.summary,
      queryFn: reviewApi.summary,
    });
  } catch {
    // 무시 — 아래 dehydrate가 빈 상태를 넘긴다
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
