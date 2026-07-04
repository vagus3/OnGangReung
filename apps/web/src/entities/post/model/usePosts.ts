import { useQuery } from "@tanstack/react-query";

import { postApi } from "../api/post.api";

export const postKeys = {
  all: ["posts"] as const,
};

export function usePosts() {
  return useQuery({
    queryKey: postKeys.all,
    queryFn: postApi.list,
  });
}
