"use client";

import { GUIDE_SECTION_LABELS } from "@/entities/guide";

type Props = {
  activeIndex: number;
  onJump: (index: number) => void;
};

/** 오른쪽 sticky 목차. 현재 보고 있는 섹션을 표시한다. */
export function GuideIndex({ activeIndex, onJump }: Props) {
  return (
    <nav aria-label="안내 목차" className="sticky top-24">
      <ol className="space-y-1">
        {GUIDE_SECTION_LABELS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === activeIndex ? "true" : undefined}
              className={
                index === activeIndex
                  ? "text-ink flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[12px] font-bold"
                  : "text-muted hover:text-ink flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[12px]"
              }
            >
              <span className="tabular-nums opacity-60">
                {String(index + 1).padStart(2, "0")}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
