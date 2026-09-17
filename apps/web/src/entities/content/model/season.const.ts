/**
 * 홈 히어로의 계절 문구.
 *
 * 디자인에서 시즌은 별도 섹션이 아니라 히어로 그 자체다. 칩으로 계절을 고르면
 * 제목과 본문이 바뀐다.
 */

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type Season = {
  id: SeasonId;
  label: string;
  eyebrow: string;
  /** 디자인은 <br />로 줄을 나눈다. 배열로 받아 컴포넌트가 나눈다. */
  titleLines: string[];
  body: string;
};

export const SEASONS: readonly [Season, ...Season[]] = [
  {
    id: "spring",
    label: "봄",
    eyebrow: "SPRING · 벚나무와 드라이브 길",
    titleLines: ["벚꽃은 경포호 둘레를", "따라 먼저 옵니다"],
    body: "호수를 한 바퀴 도는 길에 벚나무가 이어집니다. 차를 세우지 않아도 창밖으로 다 보이는 계절입니다.",
  },
  {
    id: "summer",
    label: "여름",
    eyebrow: "SUMMER · 동해",
    titleLines: ["동해 · 지금이", "가장 조용합니다"],
    body: "8월 말의 바다는 물이 아직 따뜻하고, 파라솔은 절반쯤 걷혔습니다. 사람이 빠진 해변이 원래의 동해입니다.",
  },
  {
    id: "autumn",
    label: "가을",
    eyebrow: "AUTUMN · 별",
    titleLines: ["안반데기,", "공기가 가장 맑은 밤"],
    body: "해발 700m. 구름이 발아래에 있고 그 위로 은하수가 지나갑니다. 초가을이 1년 중 가장 선명합니다.",
  },
  {
    id: "winter",
    label: "겨울",
    eyebrow: "WINTER · 정동진",
    titleLines: ["정동진, 새해는", "여기서 가장 먼저"],
    body: "바다에서 가장 가까운 역. 기차가 멈추면 플랫폼 끝에서 바로 해가 올라옵니다.",
  },
];

/** 오늘 날짜로 계절을 고른다. 첫 화면이 지금 계절로 열리는 편이 자연스럽다. */
export function currentSeason(date: Date = new Date()): SeasonId {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/** 홈 마감 섹션 — 해가 지고 나서의 강릉. */
export const NIGHT_SPOTS: readonly {
  name: string;
  line: string;
  tag: string;
}[] = [
  {
    name: "육백마지기",
    line: "차로 올라가 그대로 앉아 별을 봅니다.",
    tag: "별 · 여름–가을",
  },
  {
    name: "안반데기 은하수",
    line: "해발 700m. 달이 없는 날을 고르면 선명합니다.",
    tag: "별 · 대관령권",
  },
  {
    name: "경포 밤바다",
    line: "조명이 적어 파도 소리가 더 크게 들립니다.",
    tag: "야경 · 경포권",
  },
  {
    name: "월화거리 야경",
    line: "기찻길을 걷어낸 자리를 걸어 다닙니다.",
    tag: "야경 · 시내권",
  },
];
