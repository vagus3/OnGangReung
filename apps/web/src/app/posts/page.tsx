import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { postApi, postKeys } from "@/entities/post";
import { createQueryClient } from "@/shared/api";
import { PostsPage } from "@/views/posts";

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
