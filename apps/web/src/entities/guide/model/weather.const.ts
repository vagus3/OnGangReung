/**
 * 안내 탭 01 날씨.
 *
 * 디자인 자체가 정적 목업이라 그 값을 그대로 옮겼다. 기상청 단기예보·연안예보
 * 실연동은 `docs/api/public-data-apis.md`에 정리돼 있고 별도 슬라이스다.
 *
 * 화면의 출처 문구는 유지한다 — 연동이 붙으면 이 상수만 교체된다.
 */

export type WeatherStat = { label: string; value: string };
export type HourlyWeather = { time: string; temp: number; sky: string };
export type DailyWeather = {
  day: string;
  sky: string;
  rain: number;
  min: number;
  max: number;
};

export const WEATHER = {
  updated: "오늘 오후 2시 발표",
  source: "기상청 동해중부 연안예보",
  temp: 24,
  feels: 26,
  sky: "맑음",
  now: [
    { label: "파고", value: "0.8m" },
    { label: "수온", value: "21°" },
    { label: "바람", value: "북동 3㎧" },
  ] satisfies WeatherStat[],
  sea: [
    { label: "해수욕 적합도", value: "보통" },
    { label: "자외선 지수", value: "높음" },
    { label: "일출 · 일몰", value: "05:19 · 19:34" },
    { label: "만조 · 간조", value: "09:40 · 16:05" },
  ] satisfies WeatherStat[],
  hourly: [
    { time: "지금", temp: 24, sky: "맑음" },
    { time: "15시", temp: 25, sky: "맑음" },
    { time: "16시", temp: 25, sky: "구름 조금" },
    { time: "17시", temp: 24, sky: "구름 조금" },
    { time: "18시", temp: 23, sky: "맑음" },
    { time: "19시", temp: 22, sky: "맑음" },
    { time: "20시", temp: 21, sky: "흐림" },
    { time: "21시", temp: 20, sky: "흐림" },
  ] satisfies HourlyWeather[],
  daily: [
    { day: "오늘", sky: "맑음", rain: 10, min: 19, max: 26 },
    { day: "내일", sky: "구름 많음", rain: 30, min: 20, max: 27 },
    { day: "모레", sky: "비", rain: 70, min: 19, max: 24 },
    { day: "금요일", sky: "흐림", rain: 40, min: 18, max: 25 },
    { day: "토요일", sky: "맑음", rain: 10, min: 19, max: 27 },
  ] satisfies DailyWeather[],
} as const;

export const WEATHER_DISCLAIMER =
  "기상 정보는 기상청 동해중부 연안예보 기준이며 현장 상황과 다를 수 있습니다.";
