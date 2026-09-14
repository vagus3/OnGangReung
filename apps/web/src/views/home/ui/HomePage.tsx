import { Suspense } from "react";

import { ErrorBoundary } from "@/shared/ui";

import { HomeHero } from "./HomeHero";
import { HomeSections } from "./HomeSections";

export function HomePage() {
  return (
    <main className="mx-auto max-w-[1360px] pb-24 md:pb-12">
      <HomeHero />
      <ErrorBoundary
        fallback={
          <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
            관광지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
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
          <HomeSections />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
