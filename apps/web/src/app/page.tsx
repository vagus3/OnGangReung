import Link from "next/link";

import { env } from "@/shared/config/env";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 1rem" }}>
      <h1>{env.NEXT_PUBLIC_APP_NAME}</h1>
      <p>Next.js + FastAPI 모노레포 템플릿입니다.</p>
      <ul>
        <li>
          <Link href="/posts">예시 도메인: Posts (풀스택 CRUD 흐름)</Link>
        </li>
      </ul>
    </main>
  );
}
