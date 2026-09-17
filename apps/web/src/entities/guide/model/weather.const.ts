/**
 * 안내 탭 01 날씨.
 *
 * 디자인 자체가 정적 목업이라 그 값을 그대로 옮겼다. 기상청 단기예보·연안예보
 * 실연동은 `docs/api/public-data-apis.md`에 정리돼 있고 별도 슬라이스다.
 *
 * 실시간 예보로 오인하지 않도록 화면에 예시임을 명시한다.
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
  updated: "예시 날씨",
  source: "실시간 예보 미연동",
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
  "표시된 수치는 화면 예시이며 현재 날씨가 아닙니다. 여행 전 기상청의 최신 예보를 확인해 주세요.";
