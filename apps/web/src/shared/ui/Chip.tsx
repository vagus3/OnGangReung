import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChipProps = {
  selected?: boolean;
  /** onDark: AI 코스처럼 고정 야간 배경 위에 얹는 화면용 (토큰이 뒤집히면 안 된다) */
  tone?: "default" | "onDark";
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// 이 앱에서 가장 자주 쓰이는 컨트롤(필터·관심사·기간). 반경 999px.
// 선택 상태는 색으로만 구분하지 않는다 — aria-pressed로도 전달한다.
const base =
  "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[12.5px] " +
  "transition-colors duration-150";

const TONE = {
  default: {
    on: "bg-ink text-paper font-bold",
    off: "border-line text-muted hover:text-ink border font-medium",
  },
  onDark: {
    on: "bg-white text-[oklch(18%_0.03_258)] font-bold",
    off: "border border-white/25 bg-white/10 text-white/85 font-medium hover:bg-white/20",
  },
} as const;

export function Chip({
  selected = false,
  tone = "default",
  children,
  className = "",
  ...rest
}: ChipProps) {
  const variant = TONE[tone];
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`${base} ${selected ? variant.on : variant.off} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
