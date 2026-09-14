import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  variant?: ButtonVariant;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

// DESIGN.md 6절: 높이 44px(모바일 48), 반경 14px, 전이 150-200ms, 클릭 scale(0.98)
const base =
  "inline-flex h-12 items-center justify-center rounded-[14px] px-4 " +
  "text-[13.5px] font-medium transition-[background-color,color,transform] " +
  "duration-150 active:scale-[0.98] disabled:pointer-events-none " +
  "disabled:opacity-45 sm:h-11";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-sea text-paper hover:brightness-110",
  secondary:
    "border-line text-ink border bg-[var(--surface-80)] hover:brightness-105",
  ghost: "text-muted hover:text-ink",
};

export function Button({
  variant = "primary",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type="button" className={`${base} ${variants[variant]}`} {...rest}>
      {children}
    </button>
  );
}
