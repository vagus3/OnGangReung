import type { InputHTMLAttributes, ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

// DESIGN.md 6절: 입력 높이 48px, 반경 14px, 라벨·오류·포커스 상태 필수
export function AuthField({ id, label, error, hint, ...rest }: Props) {
  return (
    <div>
      <label htmlFor={id} className="text-ink block text-[12.5px] font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? `${id}-error` : undefined}
        className={
          error !== undefined
            ? "bg-paper text-ink mt-2 h-12 w-full rounded-[14px] border border-[oklch(55%_0.19_25)] px-4 text-[13.5px] outline-none"
            : "border-line bg-paper text-ink focus:border-sea mt-2 h-12 w-full rounded-[14px] border px-4 text-[13.5px] outline-none"
        }
        {...rest}
      />
      {hint !== undefined && (
        <p className="text-muted mt-1.5 text-[11px]">{hint}</p>
      )}
      {error !== undefined && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[11.5px] text-[oklch(55%_0.19_25)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
