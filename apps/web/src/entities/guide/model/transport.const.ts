/** 안내 탭 02 교통. 권역과 무관하게 같은 3행이고, 추천만 권역별로 달라진다. */

export type TransportRow = {
  mode: string;
  cost: string;
  time: string;
  /** 운전 부담 — 렌트는 권역에 따라 문구가 달라진다 */
  drive: string;
  booking: string;
};

export const TRANSPORT_HEADERS = [
  "1인 비용",
  "소요 시간",
  "운전 부담",
  "예매 마감",
] as const;

export function transportRows(pick: "rent" | "train"): TransportRow[] {
  return [
    {
      mode: "렌트",
      cost: "6–9만 (2인 분담)",
      time: "이동 자유",
      drive: pick === "rent" ? "대관령 경사 있음" : "주차 찾기 부담",
      booking: "주말 물량 먼저 마감",
    },
    {
      mode: "기차",
      cost: "2.8만 (KTX 편도)",
      time: "서울 2시간",
      drive: "없음",
      booking: "토요일 오전 먼저 마감",
    },
    {
      mode: "시내버스",
      cost: "1,700원",
      time: "배차 20–40분",
      drive: "없음",
      booking: "없음",
    },
  ];
}

/** 이 권역에서 추천하는 이동 수단인가 */
export function isPick(mode: string, pick: "rent" | "train"): boolean {
  return (
    (pick === "rent" && mode === "렌트") ||
    (pick === "train" && mode === "기차")
  );
}
