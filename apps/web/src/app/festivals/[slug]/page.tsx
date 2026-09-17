import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { createQueryClient } from "@/shared/api";
import { FestivalDetailPage } from "@/views/festival";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const queryClient = createQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: festivalKeys.detail(slug),
      queryFn: () => festivalApi.detail(slug),
    });
  } catch {
    // 프리페치 실패가 렌더링을 막지 않는다
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FestivalDetailPage slug={slug} />
    </HydrationBoundary>
  );
}
