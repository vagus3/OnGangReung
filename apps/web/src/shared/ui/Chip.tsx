import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChipProps = {
  selected?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

// 이 앱에서 가장 자주 쓰이는 컨트롤(필터·관심사·기간). 반경 999px.
// 선택 상태는 색으로만 구분하지 않는다 — aria-pressed로도 전달한다.
const base =
  "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[12.5px] " +
  "transition-colors duration-150";

export function Chip({ selected = false, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={
        selected
          ? `${base} bg-ink text-paper font-bold`
          : `${base} border-line text-muted hover:text-ink border font-medium`
      }
      {...rest}
    >
      {children}
    </button>
  );
}
