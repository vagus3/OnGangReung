"use client";

import { useCreatePost } from "../model/useCreatePost";
import { PostCreateForm } from "./PostCreateForm";

export function PostCreateSection() {
  const createPost = useCreatePost();

  return (
    <PostCreateForm
      onSubmit={(data) => createPost.mutate(data)}
      isPending={createPost.isPending}
    />
  );
}
