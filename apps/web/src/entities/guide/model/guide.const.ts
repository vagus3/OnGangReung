import type { Zone } from "@/entities/spot";

/**
 * 안내 탭의 권역별 콘텐츠.
 *
 * 전부 공공 API에 대응물이 없는 편집 산문이다
 * (docs/api/public-data-apis.md 3절). DB로 올리면 편집 주체가 정해지기도 전에
 * 관리자 CRUD를 만들어야 하므로 상수로 둔다 — 권역 설명을 상수로 둔 것과 같은
 * 판단이다.
 *
 * 값은 디자인 캔버스의 guideZones / guideContent에서 기계적으로 추출했다.
 */

// 뒤의 세 항목은 v3 디자인이 마크업을 지운 것들이다. 데이터와 뷰모델이
// 남아 있었고 관광 앱에서 실제로 쓰이는 정보라 되살렸다.
export const GUIDE_SECTION_LABELS = [
  "날씨",
  "교통",
  "숙박",
  "주차장",
  "먹거리",
  "축제",
  "안내소",
  "무장애",
  "회화",
] as const;

export type GuideSectionLabel = (typeof GUIDE_SECTION_LABELS)[number];

export type GuideStay = {
  name: string;
  rows: { label: string; value: string }[];
};
export type GuidePark = {
  name: string;
  near: string;
  fee: string;
  risk: string;
  walk: string;
  alt: string;
  lat: number;
  lng: number;
};
export type GuideEat = {
  name: string;
  what: string;
  hours: string;
  wait: string;
  parking: string;
};

export type GuideZoneContent = {
  id: Zone;
  name: string;
  nameEn: string;
  line: string;
  /** 이 권역에서 추천하는 이동 수단 */
  pick: "rent" | "train";
  transport: string;
  note: string;
  stays: GuideStay[];
  parks: GuidePark[];
  eats: GuideEat[];
};

export const GUIDE_ZONES: readonly [GuideZoneContent, ...GuideZoneContent[]] = [
  {
    id: "gyeongpo",
    name: "경포권",
    nameEn: "GYEONGPO",
    line: "호수와 해변이 붙어 있습니다. 처음 오는 사람이 가장 무리 없이 도는 권역입니다.",
    pick: "train",
    transport:
      "경포는 시내버스로 닿습니다. 해변만 볼 계획이면 렌트가 필요하지 않습니다.",
    note: "8월 말은 아직 성수기입니다. 기차는 주말 편성이 먼저 마감됩니다.",
    stays: [
      {
        name: "경포 해변 앞 호텔",
        rows: [
          { label: "1박", value: "18–26만" },
          { label: "명소까지", value: "해변 도보 2분" },
          { label: "권역", value: "경포권" },
        ],
      },
      {
        name: "초당동 한옥 스테이",
        rows: [
          { label: "1박", value: "12–17만" },
          { label: "명소까지", value: "순두부 도보 5분" },
          { label: "권역", value: "경포권" },
        ],
      },
    ],
    parks: [
      {
        name: "경포해변 제1주차장",
        near: "경포대 · 해변 정면",
        fee: "유료",
        risk: "주말 만차",
        walk: "2분",
        alt: "제2주차장 · 도보 6분",
        lat: 37.7956,
        lng: 128.9107,
      },
      {
        name: "오죽헌 주차장",
        near: "오죽헌 · 시립박물관",
        fee: "무료",
        risk: "여유",
        walk: "3분",
        alt: "박물관 뒤편",
        lat: 37.7844,
        lng: 128.8783,
      },
    ],
    eats: [
      {
        name: "초당 순두부 골목",
        what: "짬뽕순두부 · 초당두부",
        hours: "07:00–20:00",
        wait: "점심 40분",
        parking: "마을 공영",
      },
      {
        name: "경포 해변 회센터",
        what: "물회 · 회",
        hours: "10:00–22:00",
        wait: "20분",
        parking: "건물 지하",
      },
      {
        name: "옥수수 노점",
        what: "초당옥수수",
        hours: "09:00–해질 때까지",
        wait: "없음",
        parking: "해변 주차장",
      },
    ],
  },
  {
    id: "city",
    name: "시내권",
    nameEn: "DOWNTOWN",
    line: "명주동 골목과 중앙시장이 걸어서 이어집니다. 차를 두고 다니기 좋습니다.",
    pick: "train",
    transport:
      "시내는 걸어 다니는 편이 빠릅니다. 렌트를 하면 오히려 주차를 찾게 됩니다.",
    note: "KTX 강릉역에서 월화거리까지 도보 10분입니다.",
    stays: [
      {
        name: "강릉역 앞 비즈니스 호텔",
        rows: [
          { label: "1박", value: "9–14만" },
          { label: "명소까지", value: "월화거리 도보 8분" },
          { label: "권역", value: "시내권" },
        ],
      },
      {
        name: "명주동 골목 스테이",
        rows: [
          { label: "1박", value: "11–16만" },
          { label: "명소까지", value: "중앙시장 도보 6분" },
          { label: "권역", value: "시내권" },
        ],
      },
    ],
    parks: [
      {
        name: "중앙시장 공영주차장",
        near: "중앙시장 · 월화거리",
        fee: "유료",
        risk: "주말 만차",
        walk: "2분",
        alt: "남대천 하천 주차",
        lat: 37.7519,
        lng: 128.8961,
      },
      {
        name: "강릉역 환승주차장",
        near: "KTX 강릉역",
        fee: "유료",
        risk: "평일 여유",
        walk: "즉시",
        alt: "역 뒤편 노상",
        lat: 37.7639,
        lng: 128.8961,
      },
    ],
    eats: [
      {
        name: "중앙시장 먹자골목",
        what: "닭강정 · 어묵",
        hours: "09:00–20:00",
        wait: "10분",
        parking: "시장 공영",
      },
      {
        name: "장칼국수 노포",
        what: "장칼국수",
        hours: "10:30–19:00",
        wait: "겨울 30분",
        parking: "없음 · 도보",
      },
      {
        name: "마늘빵 베이커리",
        what: "마늘빵",
        hours: "09:00–소진 시",
        wait: "오후 품절",
        parking: "노상",
      },
    ],
  },
  {
    id: "daegwallyeong",
    name: "대관령권",
    nameEn: "DAEGWALLYEONG",
    line: "해발 700m 위의 목장과 배추밭. 구름이 발아래에 있습니다.",
    pick: "rent",
    transport: "대관령은 버스로 닿기 어렵습니다. 렌트가 사실상 필수입니다.",
    note: "안반데기 올라가는 길은 경사가 급합니다. 야간 운전은 상향등을 쓰게 됩니다.",
    stays: [
      {
        name: "대관령 목장 근처 펜션",
        rows: [
          { label: "1박", value: "13–19만" },
          { label: "명소까지", value: "안반데기 차 20분" },
          { label: "권역", value: "대관령권" },
        ],
      },
      {
        name: "소금강 산장",
        rows: [
          { label: "1박", value: "7–11만" },
          { label: "명소까지", value: "소금강 도보 3분" },
          { label: "권역", value: "대관령권" },
        ],
      },
    ],
    parks: [
      {
        name: "안반데기 주차장",
        near: "안반데기 배추밭",
        fee: "무료",
        risk: "별 보는 밤 만차",
        walk: "즉시",
        alt: "아래 임도 · 도보 10분",
        lat: 37.5972,
        lng: 128.7458,
      },
      {
        name: "올림픽뮤지엄 주차장",
        near: "뮤지엄",
        fee: "무료",
        risk: "여유",
        walk: "2분",
        alt: "없음",
        lat: 37.7628,
        lng: 128.8886,
      },
    ],
    eats: [
      {
        name: "고랭지 감자 식당",
        what: "감자 요리 · 옹심이",
        hours: "10:00–18:00",
        wait: "없음",
        parking: "가게 앞",
      },
      {
        name: "목장 카페",
        what: "우유 · 아이스크림",
        hours: "09:00–17:30",
        wait: "주말 20분",
        parking: "목장 주차장",
      },
      {
        name: "휴게소 감자빵",
        what: "감자빵",
        hours: "08:00–20:00",
        wait: "소진 시 마감",
        parking: "휴게소",
      },
    ],
  },
  {
    id: "jumunjin",
    name: "주문진권",
    nameEn: "JUMUNJIN",
    line: "항구의 아침. 수산시장 경매가 끝나기 전에 도착하면 가장 싸게 먹습니다.",
    pick: "rent",
    transport:
      "주문진은 시내버스가 있지만 배차가 깁니다. 새벽 경매를 보려면 렌트가 편합니다.",
    note: "8월 말은 아직 성수기입니다. 렌트는 주말 물량이 먼저 빠지고, 기차는 토요일 오전이 먼저 마감됩니다.",
    stays: [
      {
        name: "주문진항 앞 모텔",
        rows: [
          { label: "1박", value: "7–12만" },
          { label: "명소까지", value: "수산시장 도보 3분" },
          { label: "권역", value: "주문진권" },
        ],
      },
      {
        name: "소돌항 오션뷰 펜션",
        rows: [
          { label: "1박", value: "15–22만" },
          { label: "명소까지", value: "등대 도보 5분" },
          { label: "권역", value: "주문진권" },
        ],
      },
    ],
    parks: [
      {
        name: "주문진 수산시장 주차장",
        near: "수산시장 · 경매장",
        fee: "유료",
        risk: "새벽·주말 만차",
        walk: "즉시",
        alt: "항구 노상 · 도보 5분",
        lat: 37.8925,
        lng: 128.83,
      },
      {
        name: "소돌항 공영주차장",
        near: "소돌항 등대 · 아들바위",
        fee: "무료",
        risk: "여유",
        walk: "4분",
        alt: "해변 임시",
        lat: 37.9018,
        lng: 128.8281,
      },
    ],
    eats: [
      {
        name: "수산시장 회센터",
        what: "물회 · 회 · 오징어",
        hours: "05:00–21:00",
        wait: "점심 30분",
        parking: "시장 주차장",
      },
      {
        name: "경매장 앞 국밥",
        what: "아침 국밥",
        hours: "04:30–11:00",
        wait: "없음",
        parking: "항구 노상",
      },
      {
        name: "방파제 오징어 노점",
        what: "오징어 구이",
        hours: "11:00–19:00",
        wait: "10분",
        parking: "노상",
      },
    ],
  },
  {
    id: "jeongdongjin",
    name: "정동진 · 옥계권",
    nameEn: "JEONGDONGJIN",
    line: "바다에서 가장 가까운 역. 일출을 목적으로 오는 구간입니다.",
    pick: "train",
    transport: "정동진은 기차가 곧 목적입니다. 역이 해변에 붙어 있습니다.",
    note: "1월 1일 새해 열차는 12월 초에 마감됩니다.",
    stays: [
      {
        name: "썬크루즈 리조트",
        rows: [
          { label: "1박", value: "20–32만" },
          { label: "명소까지", value: "모래시계 차 5분" },
          { label: "권역", value: "정동진권" },
        ],
      },
      {
        name: "정동진역 앞 민박",
        rows: [
          { label: "1박", value: "5–9만" },
          { label: "명소까지", value: "역 도보 2분" },
          { label: "권역", value: "정동진권" },
        ],
      },
    ],
    parks: [
      {
        name: "정동진역 주차장",
        near: "정동진역 · 해변",
        fee: "유료",
        risk: "일출 시간 만차",
        walk: "즉시",
        alt: "모래시계공원 주차장",
        lat: 37.6906,
        lng: 129.0331,
      },
      {
        name: "헌화로 노상",
        near: "헌화로 드라이브",
        fee: "무료",
        risk: "주말 빠뜯",
        walk: "즉시",
        alt: "금진항 주차장",
        lat: 37.6383,
        lng: 129.0347,
      },
    ],
    eats: [
      {
        name: "정동진역 앞 분식",
        what: "어묵 · 오뎅",
        hours: "05:00–19:00",
        wait: "일출 후 20분",
        parking: "역 주차장",
      },
      {
        name: "금진항 물회집",
        what: "물회",
        hours: "10:00–20:00",
        wait: "주말 30분",
        parking: "항구 노상",
      },
      {
        name: "헌화로 카페",
        what: "커피 · 바다 전망",
        hours: "09:00–21:00",
        wait: "없음",
        parking: "카페 앞",
      },
    ],
  },
];

export function findGuideZone(id: Zone): GuideZoneContent | undefined {
  return GUIDE_ZONES.find((zone) => zone.id === id);
}
