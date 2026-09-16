import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { spotApi, spotKeys } from "@/entities/spot";
import { createQueryClient } from "@/shared/api";
import { SpotDetailPage } from "@/views/spot";

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
      queryKey: spotKeys.detail(slug),
      queryFn: () => spotApi.detail(slug),
    });
  } catch {
    // 프리페치 실패가 렌더링을 막지 않는다. ErrorBoundary가 상태를 알린다.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SpotDetailPage slug={slug} />
    </HydrationBoundary>
  );
}
