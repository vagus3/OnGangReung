import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { themeApi, themeKeys } from "@/entities/theme";
import { createQueryClient } from "@/shared/api";
import { ThemeDetailPage } from "@/views/theme";

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
      queryKey: themeKeys.detail(slug),
      queryFn: () => themeApi.detail(slug),
    });
  } catch {
    // 프리페치 실패가 렌더링을 막지 않는다
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ThemeDetailPage slug={slug} />
    </HydrationBoundary>
  );
}
