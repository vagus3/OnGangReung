"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { postApi, postKeys } from "@/entities/post";

export function PostsList() {
  const { data: posts } = useSuspenseQuery({
    queryKey: postKeys.all,
    queryFn: postApi.list,
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </li>
      ))}
    </ul>
  );
}
