import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";

export type Post = components["schemas"]["PostRead"];
export type PostCreate = components["schemas"]["PostCreate"];

export const postApi = {
  list: async (): Promise<Post[]> => {
    const { data, error } = await apiClient.GET("/api/v1/posts");
    if (error !== undefined)
      throw toApiError(error, "게시글 목록을 불러오지 못했습니다");
    return data;
  },

  create: async (body: PostCreate): Promise<Post> => {
    const { data, error } = await apiClient.POST("/api/v1/posts", { body });
    if (error !== undefined)
      throw toApiError(error, "게시글을 작성하지 못했습니다");
    return data;
  },
};
