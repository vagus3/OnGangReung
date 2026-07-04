import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApi, postKeys } from "@/entities/post";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
}
