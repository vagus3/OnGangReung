/**
 * 마이페이지와 안내 탭이 쓰는 고정 콘텐츠.
 *
 * 공지·약관·안내센터·회화·긴급연락·무장애 경로 — 전부 공공 API에 대응물이
 * 없는 편집 저작물이다. 값은 디자인 캔버스에서 기계적으로 추출했다.
 */

export type Notice = {
  id: string;
  date: string;
  category: string;
  title: string;
  body: string;
};
export type Policy = {
  id: string;
  title: string;
  updated: string;
  lines: string[];
};
export type Center = {
  id: string;
  name: string;
  address: string;
  hours: string;
  tel: string;
  wheelchair: boolean;
  note: string;
};
export type Phrase = { id: string; ko: string; en: string };
export type Emergency = { label: string; number: string };
export type AccessRoute = {
  id: string;
  name: string;
  desc: string;
  tags: string[];
};
export type AccessInfo = {
  key: string;
  title: string;
  desc: string;
  link: string;
  linkLabel: string;
};

export const NOTICES: readonly Notice[] = [
  {
    id: "n1",
    date: "2026.08.12",
    category: "서비스",
    title: "AI 코스 추천 엔진 업데이트 안내",
    body: "AI 코스 생성 시 이동 시간 계산 기준을 시내버스 실시간 배차 정보로 변경했습니다. 기존에 저장한 일정은 그대로 유지되며, 새로 생성하는 일정부터 반영됩니다.",
  },
  {
    id: "n2",
    date: "2026.08.05",
    category: "축제",
    title: "강릉커피축제 2026 사전 예약 오픈",
    body: "10월 개최 예정인 강릉커피축제의 로스터리 시음 프로그램 사전 예약이 열렸습니다. 안목 커피거리 12개 매장이 참여하며, 회차당 40명으로 제한됩니다.",
  },
  {
    id: "n3",
    date: "2026.07.28",
    category: "점검",
    title: "정기 서버 점검 (8/1 02:00 ~ 05:00)",
    body: "점검 시간 동안 AI 코스 생성과 저장 기능이 일시 중단됩니다. 이미 저장한 장소와 스탬프 기록은 영향을 받지 않습니다.",
  },
  {
    id: "n4",
    date: "2026.07.15",
    category: "무장애",
    title: "열린관광지 휠체어 대여소 2곳 추가",
    body: "주문진 수산시장과 정동진역 안내소에 전동 보조기기 대여소가 추가되었습니다. 신분증 지참 후 당일 반납 조건으로 무상 이용할 수 있습니다.",
  },
];

export const POLICIES: readonly Policy[] = [
  {
    id: "terms",
    title: "이용약관",
    updated: "2026.06.01 개정",
    lines: [
      "본 약관은 온강릉이 제공하는 관광정보 서비스의 이용 조건과 절차, 이용자와 서비스 제공자의 권리·의무를 정합니다.",
      "이용자는 관광지 정보, AI 코스 추천, 저장 및 스탬프 기록 기능을 무료로 이용할 수 있습니다.",
      "서비스에 게시된 관광지 정보는 강릉시 관광포털과 한국관광공사 자료를 기준으로 하며, 현장 사정에 따라 변경될 수 있습니다.",
    ],
  },
  {
    id: "privacy",
    title: "개인정보 처리방침",
    updated: "2026.06.01 개정",
    lines: [
      "수집 항목: 이름(닉네임), 이메일, 연락처, 저장한 장소 및 방문 스탬프 기록.",
      "이용 목적: 코스 추천 개인화, 저장 목록 동기화, 공지 및 알림 발송.",
      "보유 기간: 회원 탈퇴 시 즉시 파기하며, 관계 법령에 따라 보존이 필요한 기록은 해당 기간 동안만 별도 보관합니다.",
    ],
  },
  {
    id: "lbs",
    title: "위치기반서비스 이용약관",
    updated: "2026.06.01 개정",
    lines: [
      "현재 위치 기반으로 가까운 관광안내소와 정류장을 안내하기 위해 위치정보를 이용합니다.",
      "위치정보는 안내 목적에만 사용되며 별도로 저장하지 않습니다.",
      "기기 설정에서 위치 권한을 해제하면 위치 기반 안내만 제한되고 다른 기능은 정상 이용할 수 있습니다.",
    ],
  },
  {
    id: "ai",
    title: "AI 서비스 책임한계 고지",
    updated: "2026.06.01 고지",
    lines: [
      "AI가 생성한 코스는 참고 자료이며, 운영시간·휴무일·요금은 방문 전 현장 확인이 필요합니다.",
      "실시간 교통 상황과 기상 변화는 생성 시점 기준으로만 반영됩니다.",
      "생성 결과에 오류가 있는 경우 관광안내소(1330) 또는 문의 채널로 알려주시면 반영합니다.",
    ],
  },
];

export const CENTERS: readonly Center[] = [
  {
    id: "c1",
    name: "경포 관광안내센터",
    address: "강릉시 안현동 산2-11",
    hours: "09:00 – 18:00",
    tel: "1330",
    wheelchair: true,
    note: "휠체어 · 전동 보조기기 무상 대여",
  },
  {
    id: "c2",
    name: "강릉역 관광통역안내센터",
    address: "강릉시 용지로 176",
    hours: "09:00 – 18:00",
    tel: "1330",
    wheelchair: true,
    note: "4개 국어 통역 안내",
  },
  {
    id: "c3",
    name: "터미널 관광안내소",
    address: "강릉시 하슬라로 15",
    hours: "09:00 – 18:00",
    tel: "1330",
    wheelchair: false,
    note: "시외 · 고속버스 터미널 내",
  },
  {
    id: "c4",
    name: "주문진 관광안내센터",
    address: "강릉시 주문진읍 해안로 1734",
    hours: "09:00 – 18:00",
    tel: "1330",
    wheelchair: true,
    note: "수산시장 · 등대 도보 7분",
  },
  {
    id: "c5",
    name: "유천 관광안내소",
    address: "강릉시 유천동 유천지구",
    hours: "09:00 – 18:00",
    tel: "1330",
    wheelchair: false,
    note: "택지지구 · 시내버스 환승 안내",
  },
  {
    id: "c6",
    name: "안목 관광안내소",
    address: "강릉시 창해로14번길 (안목해변)",
    hours: "09:00 – 18:00",
    tel: "1330",
    wheelchair: true,
    note: "커피거리 · 솔바람다리 안내",
  },
];

export const PHRASES: readonly Phrase[] = [
  {
    id: "p1",
    ko: "이 근처에 화장실이 어디에 있나요?",
    en: "Where is the restroom nearby?",
  },
  { id: "p2", ko: "이거 얼마예요?", en: "How much is this?" },
  {
    id: "p3",
    ko: "가장 가까운 버스 정류장이 어디인가요?",
    en: "Where is the nearest bus stop?",
  },
  {
    id: "p4",
    ko: "병원에 가야 해요, 도와주세요.",
    en: "I need to go to a hospital, please help.",
  },
];

export const EMERGENCY: readonly Emergency[] = [
  { label: "관광통역안내", number: "1330" },
  { label: "응급의료 · 소방", number: "119" },
  { label: "경찰", number: "112" },
];

export const ACCESS_ROUTES: readonly AccessRoute[] = [
  {
    id: "ar1",
    name: "경포해변 · 경포생태저류지",
    desc: "2020 열린관광지. 장애인 주차구역과 화장실, 무장애 데크길, 촉지음성안내판을 갖췄고 저류지 구간은 전 구간 평탄해 유모차 · 휠체어로 오죽헌까지 이동할 수 있습니다.",
    tags: ["장애인 화장실", "무장애 데크길", "점자안내판", "휠체어 대여"],
  },
  {
    id: "ar2",
    name: "안목해변 · 강릉커피거리",
    desc: "2020 열린관광지. 출입구까지 턱이 없어 휠체어 접근이 가능하고, 전동휠체어 급속 충전기와 남녀 구분 장애인 화장실을 갖췄습니다.",
    tags: [
      "장애인 화장실",
      "전동휠체어 충전",
      "무단차 접근로",
      "장애인 주차장",
    ],
  },
  {
    id: "ar3",
    name: "오죽헌 · 시립박물관",
    desc: "신사임당과 율곡 이이의 생가입니다. 장애인 주차장과 화장실을 갖추고 있으며, 경포생태저류지 산책로를 통해 도보 · 휠체어로 접근할 수 있습니다.",
    tags: ["장애인 주차장", "장애인 화장실", "평탄 접근로"],
  },
];

export const ACCESS_INFO: readonly AccessInfo[] = [
  {
    key: "wheelchair",
    title: "휠셰어 — 전동 보조기기 무상 대여",
    desc: "경포 · 강릉역 · 주문진 · 안목 안내소에서 수동 휠체어와 전동 보조기기를 무상으로 빌릴 수 있습니다. 신분증 지참, 당일 반납 기준.",
    link: "bf.gn.go.kr",
    linkLabel: "강릉 무장애 관광정보",
  },
  {
    key: "relay",
    title: "107 손말이음센터",
    desc: "청각 · 언어 장애인을 위한 통신중계 서비스입니다. 107번으로 연결하면 문자 · 영상 통화로 안내소와 통화할 수 있습니다.",
    link: "107relay.or.kr",
    linkLabel: "손말이음센터",
  },
  {
    key: "official",
    title: "강릉시 공식 관광정보",
    desc: "강릉시청 문화관광과에서 운영하는 공식 홈페이지입니다. 코스 · 축제 · 안내소 정보의 원본 자료를 확인할 수 있습니다. 문의 033-640-5420.",
    link: "gn.go.kr/tour",
    linkLabel: "강릉관광 공식 홈페이지",
  },
];
