import Link from "next/link";

import { env } from "@/shared/config/env";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-160 px-4 py-16">
      <h1 className="font-display text-ink text-4xl">
        {env.NEXT_PUBLIC_APP_NAME}
      </h1>
      <p className="text-muted mt-4 text-base">
        Next.js + FastAPI 모노레포 템플릿입니다.
      </p>
      <ul className="mt-6">
        <li>
          <Link href="/posts" className="hover:text-ink text-sea underline">
            예시 도메인: Posts (풀스택 CRUD 흐름)
          </Link>
        </li>
      </ul>
    </main>
  );
}
