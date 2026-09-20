"use client";

import { useQuery } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { reviewApi, reviewKeys } from "@/entities/review";
import { spotApi, spotKeys, type HomeRail } from "@/entities/spot";
import { FestivalSection } from "@/features/festival-list";
import { ReviewCarousel } from "@/features/review-carousel";
import { SpotRail } from "@/features/spot-rail";
import { QueryFeedback } from "@/shared/ui";

import { HomeSection } from "./HomeSection";

// 캔버스는 섹션 배경을 sand ↔ 지면으로 번갈아 깔아 경계를 만든다.
// 히어로 다음이 sand(AI 티저)이므로 해변부터 지면으로 이어진다.
const RAILS: ReadonlyArray<{
  rail: HomeRail;
  eyebrow: string;
  title: string;
  tone: "paper" | "sand";
}> = [
  {
    rail: "beach",
    eyebrow: "BEACH",
    title: "파도 소리를 기준으로 골라봐요",
    tone: "paper",
  },
  { rail: "food", eyebrow: "FOOD", title: "뭐 먹으러 가볼래요?", tone: "sand" },
  {
    rail: "hot",
    eyebrow: "TRENDING",
    title: "요즘 뭐가 핫한지 둘러봐요",
    tone: "paper",
  },
];

export function HomeSections() {
  // Independent queries start together; one failed endpoint cannot hide the others.
  const spots = useQuery({
    queryKey: spotKeys.list({ limit: 100 }),
    queryFn: () => spotApi.list({ limit: 100 }),
  });
  const festivals = useQuery({
    queryKey: festivalKeys.list(),
    queryFn: () => festivalApi.list(),
  });
  const reviews = useQuery({
    queryKey: reviewKeys.summary,
    queryFn: reviewApi.summary,
  });

  return (
    <>
      {spots.data ? (
        RAILS.map(({ rail, eyebrow, title, tone }) => (
          <HomeSection key={rail} tone={tone}>
            <SpotRail
              eyebrow={eyebrow}
              title={title}
              spots={spots.data.filter((spot) => spot.rail === rail)}
            />
          </HomeSection>
        ))
      ) : (
        <HomeSection>
          <QueryFeedback label="관광지 정보" query={spots} />
        </HomeSection>
      )}

      <HomeSection tone="sand">
        {festivals.data ? (
          <FestivalSection festivals={festivals.data} />
        ) : (
          <QueryFeedback label="축제 정보" query={festivals} />
        )}
      </HomeSection>

      <HomeSection>
        {reviews.data ? (
          <ReviewCarousel summary={reviews.data} />
        ) : (
          <QueryFeedback label="후기" query={reviews} />
        )}
      </HomeSection>
    </>
  );
}
