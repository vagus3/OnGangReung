import type { SpotCategory, Zone } from "@/entities/spot";

export type ZoneInfo = {
  id: Zone;
  name: string;
  en: string;
  line: string;
  desc: string;
};

// 권역 표시 문구는 공공 API에 대응물이 없는 편집 저작물이다.
// TourAPI의 sigungu는 "강릉시" 하나로 끝나므로 이 분류는 우리 것이다.
// DB 테이블로 만들지 않은 이유: 5개로 고정이고 편집 주체가 정해지기 전까지
// 관리자 CRUD(=CMS)를 만들 이유가 없다. docs/api/public-data-apis.md 3절 참조.
// 비어있지 않은 튜플로 타이핑한다. noUncheckedIndexedAccess가 켜져 있어
// readonly ZoneInfo[]면 ZONES[0]이 undefined 가능성으로 잡힌다.
export const ZONES: readonly [ZoneInfo, ...ZoneInfo[]] = [
  {
    id: "gyeongpo",
    name: "경포권",
    en: "GYEONGPO",
    line: "호수와 해변, 그리고 오죽헌",
    desc: "경포호를 둘러 걷는 생태·문화 탐방길과 동해안 최고의 해변이 이어집니다. 오죽헌·시립박물관과 허균·허난설헌 기념공원이 도보권에 모여 있습니다.",
  },
  {
    id: "city",
    name: "시내권",
    en: "DOWNTOWN",
    line: "골목과 시장, 커피 한 줄기",
    desc: "명주동 골목과 월화거리, 중앙시장이 걸어서 이어집니다. 안목 커피거리의 로스터리도 이 권역에서 시작합니다.",
  },
  {
    id: "daegwallyeong",
    name: "대관령권",
    en: "DAEGWALLYEONG",
    line: "해발 700m 위의 목장과 배추밭",
    desc: "구름이 발아래에 있는 고원입니다. 안반데기와 육백마지기는 달이 없는 밤을 고르면 은하수까지 보입니다.",
  },
  {
    id: "jumunjin",
    name: "주문진권",
    en: "JUMUNJIN",
    line: "항구의 아침",
    desc: "수산시장 경매가 끝나기 전에 도착하면 가장 싸게 먹습니다. 등대와 해변이 시장에서 도보 거리에 있습니다.",
  },
  {
    id: "jeongdongjin",
    name: "정동진 · 옥계권",
    en: "JEONGDONGJIN",
    line: "바다에서 가장 가까운 역",
    desc: "일출을 목적으로 오는 구간입니다. 새벽 다섯 시의 플랫폼이 이 도시에서 가장 붐빕니다.",
  },
];

export const CATEGORY_LABELS: Record<SpotCategory, string> = {
  nature: "자연",
  cafe: "카페",
  history: "역사",
  food: "맛집",
  downtown: "도심",
};

export function findZone(id: Zone): ZoneInfo | undefined {
  return ZONES.find((zone) => zone.id === id);
}
