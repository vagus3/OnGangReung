"use client";

import { useEffect } from "react";

import { hydrateTheme, useThemeStore, type ThemeMode } from "./theme.store";

const OPTIONS: ReadonlyArray<{ mode: ThemeMode; label: string }> = [
  { mode: "light", label: "밝게" },
  { mode: "dark", label: "어둡게" },
  { mode: "system", label: "시스템" },
];

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  // 저장값 반영을 마운트 이후로 미룬다. 서버 렌더링 결과와 첫 클라이언트
  // 렌더링이 어긋나면 hydration 오류가 난다.
  useEffect(() => {
    hydrateTheme();
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="화면 모드"
      className="border-line flex items-center gap-1 rounded-full border p-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          role="radio"
          aria-checked={mode === option.mode}
          onClick={() => setMode(option.mode)}
          className={
            mode === option.mode
              ? "bg-ink text-paper rounded-full px-3 py-1 text-[11.5px] font-bold"
              : "text-muted hover:text-ink rounded-full px-3 py-1 text-[11.5px]"
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
