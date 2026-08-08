import { Suspense } from "react";

import { PostCreateSection } from "@/features/post-create";
import { ErrorBoundary } from "@/shared/ui";

import { PostsList } from "./PostsList";

export function PostsPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Posts</h1>
      <PostCreateSection />
      <ErrorBoundary
        fallback={
          <p role="alert">
            목록을 불러오지 못했습니다. API 서버가 실행 중인지 확인하세요.
          </p>
        }
      >
        <Suspense fallback={<p>불러오는 중…</p>}>
          <PostsList />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
