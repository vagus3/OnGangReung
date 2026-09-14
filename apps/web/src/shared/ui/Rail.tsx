import type { ReactNode } from "react";

type RailProps = {
  label: string;
  children: ReactNode;
};

// 홈의 해변·먹거리·인기·야경 섹션이 전부 이 형태다. 가로 스크롤 + 스냅.
// 키보드 접근을 위해 tabIndex를 준다 (DESIGN.md 8절).
export function Rail({ label, children }: RailProps) {
  return (
    <ul
      aria-label={label}
      tabIndex={0}
      className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:px-12"
    >
      {children}
    </ul>
  );
}

export function RailItem({ children }: { children: ReactNode }) {
  return <li className="shrink-0 snap-start">{children}</li>;
}
