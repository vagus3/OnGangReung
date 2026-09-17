"use client";

import { useEffect } from "react";

import { useSavesStore } from "../model/saves.store";

/** 장소를 저장 목록에 넣고 뺀다. 로그인 없이 동작한다 (ADR 008). */
export function SaveButton({ slug }: { slug: string }) {
  const hydrate = useSavesStore((s) => s.hydrate);
  const saved = useSavesStore((s) => s.saved);
  const toggleSave = useSavesStore((s) => s.toggleSave);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const on = saved.has(slug);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggleSave(slug)}
      className={
        on
          ? "bg-ink text-paper inline-flex h-11 items-center rounded-[14px] px-4 text-[12.5px] font-bold"
          : "border-line text-ink inline-flex h-11 items-center rounded-[14px] border px-4 text-[12.5px]"
      }
    >
      {on ? "저장됨" : "저장하기"}
    </button>
  );
}
