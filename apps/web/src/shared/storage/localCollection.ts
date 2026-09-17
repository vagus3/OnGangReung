/**
 * 기기 로컬 보관.
 *
 * 저장한 장소와 방문 스탬프는 로그인 없이도 동작한다 (ADR 008). 관광 앱에서
 * 첫 방문자에게 회원가입을 요구하면 이탈하고, 스탬프는 현장에서 즉흥적으로
 * 찍는 기능이다.
 *
 * localStorage 접근은 사생활 보호 모드 등에서 막힐 수 있어 전부 감싼다.
 * 읽기가 실패하면 빈 값으로 떨어지고, 쓰기가 실패해도 이번 세션에는 적용된
 * 상태로 남는다.
 */

export function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

export function writeSet(key: string, value: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...value]));
  } catch {
    // 저장 실패는 무시한다
  }
}

export function readRecord(key: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function writeRecord(key: string, value: Record<string, string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다
  }
}
