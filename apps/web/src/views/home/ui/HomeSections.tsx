"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { spotApi, spotKeys, type HomeRail } from "@/entities/spot";
import { SpotRail } from "@/features/spot-rail";

// 디자인의 홈 레일 구성. 제목 문구도 디자인 그대로다.
const RAILS: ReadonlyArray<{ rail: HomeRail; eyebrow: string; title: string }> =
  [
    { rail: "beach", eyebrow: "BEACH", title: "파도 소리를 기준으로 골라봐요" },
    { rail: "food", eyebrow: "FOOD", title: "뭐 먹으러 가볼래요?" },
    { rail: "hot", eyebrow: "TRENDING", title: "요즘 뭐가 핫한지 둘러봐요" },
    { rail: "night", eyebrow: "NIGHT", title: "해가 지고 나서의 강릉" },
  ];

export function HomeSections() {
  // 한 번 받아 레일별로 나눈다. 레일마다 요청하면 4번 왕복한다.
  const { data: spots } = useSuspenseQuery({
    queryKey: spotKeys.list({ limit: 100 }),
    queryFn: () => spotApi.list({ limit: 100 }),
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
    </>
  );
}
