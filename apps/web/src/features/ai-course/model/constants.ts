import type { CourseRequest } from "@/entities/ai-course";

/** 디자인의 위저드 선택지. */
export const INTERESTS = [
  "자연",
  "맛집",
  "카페",
  "역사문화",
  "액티비티",
  "사진명소",
] as const;

export const DURATIONS = ["당일치기", "1박2일", "2박3일"] as const;

export type Preset = {
  id: string;
  title: string;
  body: string;
  meta: string;
  interests: string[];
  duration: NonNullable<CourseRequest["duration"]>;
  prompt: string;
};

export const PRESETS: readonly Preset[] = [
  {
    id: "family",
    title: "아이랑 가는 강릉",
    body: "이동 짧게, 앉을 곳 많게. 실내 대안을 하루에 하나씩 끼워 둡니다.",
    meta: "가족 · 1박 2일",
    interests: ["자연", "맛집"],
    duration: "1박2일",
    prompt: "아이 둘과 1박 2일, 이동은 짧게",
  },
  {
    id: "bread",
    title: "빵만 보고 갑니다",
    body: "마늘빵, 감자빵, 그리고 줄이 짧은 시간대까지.",
    meta: "빵지순례 · 당일",
    interests: ["맛집", "카페"],
    duration: "당일치기",
    prompt: "빵지순례만, 반나절",
  },
  {
    id: "night",
    title: "별을 보러",
    body: "육백마지기와 안반데기. 별을 보기 좋은 장소를 중심으로 계획합니다.",
    meta: "야경 · 별 · 1박",
    interests: ["사진명소", "자연"],
    duration: "1박2일",
    prompt: "별 보러, 1박",
  },
  {
    id: "first",
    title: "처음이라면 이 순서",
    body: "바다, 커피, 순두부, 일출. 강릉의 정석만 모았습니다.",
    meta: "1박 2일 정석",
    interests: ["자연", "카페"],
    duration: "1박2일",
    prompt: "처음 강릉, 1박 2일 정석",
  },
];
