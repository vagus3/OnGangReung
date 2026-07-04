"use client";

import { usePosts } from "@/entities/post";
import { PostCreateForm, useCreatePost } from "@/features/post-create";

export function PostsPage() {
  const { data: posts, isLoading, isError } = usePosts();
  const createPost = useCreatePost();

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Posts</h1>
      <PostCreateForm
        onSubmit={(data) => createPost.mutate(data)}
        isPending={createPost.isPending}
      />
      {isLoading && <p>불러오는 중…</p>}
      {isError && (
        <p role="alert">
          목록을 불러오지 못했습니다. API 서버가 실행 중인지 확인하세요.
        </p>
      )}
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
