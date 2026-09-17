import { Suspense } from "react";

import { ErrorBoundary, SectionHeading } from "@/shared/ui";

import { InfoSections } from "./InfoSections";

export function InfoPage() {
  return (
    <main className="mx-auto max-w-[1360px] pb-24 md:pb-12">
      <div className="border-line border-b py-12">
        <SectionHeading eyebrow="GUIDE" title="어느 권역부터 도실 건가요?" />
        <p className="text-muted mt-3 max-w-[52ch] px-4 text-[13.5px] leading-relaxed sm:px-12">
          강릉을 다섯 권역으로 나눠 담았습니다. 권역을 고르면
          교통·숙박·주차·먹거리·축제를 그 권역 기준으로 볼 수 있습니다.
        </p>
      </div>

      <ErrorBoundary
        fallback={
          <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
            권역 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
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
          <InfoSections />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
