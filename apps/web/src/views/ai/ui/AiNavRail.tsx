"use client";

import Link from "next/link";
import { useState } from "react";

import { NAV_TABS } from "@/widgets/site-nav";

// 캔버스는 지금 보고 있는 탭(ai)을 뺀 나머지를 세로로 세운다.
const RAIL_TABS = NAV_TABS.filter((tab) => tab.href !== "/ai");

/**
 * AI 코스 화면 우측 상단의 플로팅 메뉴. 캔버스는 이 화면에서 상단 네비를
 * 걷어내고 이 레일로 대신한다 — 몰입 화면이라 가로 바가 시야를 가르는 걸
 * 피한 것이다. 여기서는 상단 네비를 남겨둔 채 레일을 더해, 좁은 화면에서도
 * 이동 경로가 하나는 남게 한다.
 *
 * 동그란 버튼을 누르면 탭 묶음이 접히고 펴진다 (캔버스의 toggleRail).
 */
export function AiNavRail() {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed top-24 right-4 z-40 hidden flex-col items-center gap-2.5 lg:flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴 열기/닫기"
        aria-expanded={open}
        title="메뉴"
        className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--surface-30)] bg-[var(--surface-13)] text-[11px] font-bold text-white/80 backdrop-blur"
      >
        {/* 캔버스는 여기에 마스코트(하슬랑) 이미지를 넣는다. 아직 에셋이
            없으므로 이름 첫 글자로 자리를 지킨다. */}
        하
      </button>

      <div
        // 캔버스의 railStyle — 오른쪽 위를 축으로 접힌다
        style={{
          transformOrigin: "top right",
          transition:
            "opacity .3s ease, transform .34s cubic-bezier(.2,.8,.2,1)",
          opacity: open ? 1 : 0,
          transform: open
            ? "translateX(0) scale(1)"
            : "translateX(14px) scale(0.94)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <nav
          aria-label="다른 탭으로 이동"
          aria-hidden={!open}
          className="flex w-[62px] flex-col items-stretch gap-1.5 rounded-[18px] border border-[var(--surface-30)] bg-[var(--surface-13)] px-[5px] py-[7px] backdrop-blur"
        >
          {RAIL_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              tabIndex={open ? undefined : -1}
              className="flex min-h-[46px] items-center justify-center rounded-[12px] px-0.5 py-3 text-center text-[10.5px] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap text-white/85 transition hover:scale-[1.04] hover:bg-white/20 hover:text-white"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
