import { Suspense } from "react";

import { ErrorBoundary, SectionHeading } from "@/shared/ui";

import { ThemeListBody } from "./ThemeListBody";

export function ThemeListPage() {
  return (
    <main className="mx-auto max-w-[1360px] pb-24 md:pb-12">
      <div className="border-line border-b py-12">
        <SectionHeading eyebrow="THEME" title="무엇을 보러 갈지부터 고르기" />
        <p className="text-muted mt-3 max-w-[52ch] px-4 text-[13.5px] leading-relaxed sm:px-12">
          권역이 아니라 주제로 묶은 코스입니다. 빵만 보고 가는 하루, 차 없이
          걷는 하루처럼 목적이 하나일 때 씁니다.
        </p>
      </div>
      <ErrorBoundary
        fallback={
          <p className="text-muted px-4 py-16 text-[12.5px] sm:px-12">
            테마를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
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
          <ThemeListBody />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
