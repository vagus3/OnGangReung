"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { reviewApi, reviewKeys } from "@/entities/review";
import { spotApi, spotKeys, type HomeRail } from "@/entities/spot";
import { FestivalSection } from "@/features/festival-list";
import { ReviewCarousel } from "@/features/review-carousel";
import { SpotRail } from "@/features/spot-rail";

// 디자인의 홈 레일 구성. 제목 문구도 디자인 그대로다.
const RAILS: ReadonlyArray<{ rail: HomeRail; eyebrow: string; title: string }> =
  [
    { rail: "beach", eyebrow: "BEACH", title: "파도 소리를 기준으로 골라봐요" },
    { rail: "food", eyebrow: "FOOD", title: "뭐 먹으러 가볼래요?" },
    { rail: "hot", eyebrow: "TRENDING", title: "요즘 뭐가 핫한지 둘러봐요" },
  ];
// 야경은 레일이 아니라 마감 섹션이다 (HomeNight). 디자인의 homeNightData는
// 관광지가 아니라 별도 편집 콘텐츠다.

export function HomeSections() {
  // 한 번 받아 레일별로 나눈다. 레일마다 요청하면 4번 왕복한다.
  const { data: spots } = useSuspenseQuery({
    queryKey: spotKeys.list({ limit: 100 }),
    queryFn: () => spotApi.list({ limit: 100 }),
  });
  const { data: festivals } = useSuspenseQuery({
    queryKey: festivalKeys.list(),
    queryFn: () => festivalApi.list(),
  });
  const { data: reviews } = useSuspenseQuery({
    queryKey: reviewKeys.summary,
    queryFn: reviewApi.summary,
  });

  return (
    <>
      {RAILS.map(({ rail, eyebrow, title }) => (
        <SpotRail
          key={rail}
          eyebrow={eyebrow}
          title={title}
          spots={spots.filter((spot) => spot.rail === rail)}
        />
      ))}

      {/* 디자인 순서: 해변 · 먹거리 · 인기 다음이 축제, 마지막이 야경 */}
      <FestivalSection festivals={festivals} />

      <ReviewCarousel summary={reviews} />
    </>
  );
}
