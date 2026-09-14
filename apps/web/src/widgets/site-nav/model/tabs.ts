export type NavTab = {
  href: string;
  label: string;
  shortLabel: string;
};

// DESIGN.md 6절: 모바일 하단 탭바 최대 5개.
// 탭 전환은 클라이언트 상태가 아니라 라우트다 — 링크와 SSR이 유지된다.
export const NAV_TABS: readonly NavTab[] = [
  { href: "/", label: "홈", shortLabel: "홈" },
  { href: "/info", label: "안내", shortLabel: "안내" },
  { href: "/ai", label: "AI 코스", shortLabel: "AI코스" },
  { href: "/theme", label: "테마", shortLabel: "테마" },
  { href: "/my", label: "마이페이지", shortLabel: "MY" },
];

export function isActiveTab(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
