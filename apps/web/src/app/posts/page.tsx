import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { postApi, postKeys } from "@/entities/post";
import { createQueryClient } from "@/shared/api";
import { PostsPage } from "@/views/posts";

// 요청 시점의 API 데이터에 의존하는 페이지다. 기본값(정적 프리렌더)으로 두면
// 빌드 시점에 API를 호출하고, API가 없는 환경(CI 포함)에서 빌드가 통째로 깨진다.
export const dynamic = "force-dynamic";

export default async function Page() {
  const queryClient = createQueryClient();
  await queryClient.prefetchQuery({
    queryKey: postKeys.all,
    queryFn: postApi.list,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsPage />
    </HydrationBoundary>
  );
}
