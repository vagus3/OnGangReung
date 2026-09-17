import Link from "next/link";
import { Suspense } from "react";

import { ErrorBoundary } from "@/shared/ui";

import { FestivalDetailBody } from "./FestivalDetailBody";

export function FestivalDetailPage({ slug }: { slug: string }) {
  return (
    <main className="mx-auto max-w-[1360px] pb-24 md:pb-12">
      <div className="px-4 py-6 sm:px-12">
        <Link href="/info" className="text-muted hover:text-ink text-[12.5px]">
          ← 돌아가기
        </Link>
      </div>
      <ErrorBoundary
        fallback={
          <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
            축제 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        }
      >
        <Suspense
          fallback={
            <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
              불러오는 중입니다…
            </p>
          }
        >
          <FestivalDetailBody slug={slug} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
