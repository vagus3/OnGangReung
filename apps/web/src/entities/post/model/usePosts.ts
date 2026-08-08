import { useQuery } from "@tanstack/react-query";

import { postApi } from "../api/post.api";
import { postKeys } from "./post.keys";

export function usePosts() {
  return useQuery({
    queryKey: postKeys.all,
    queryFn: postApi.list,
  });
}
