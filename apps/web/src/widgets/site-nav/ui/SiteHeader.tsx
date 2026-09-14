"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/shared/theme";

import { isActiveTab, NAV_TABS } from "../model/tabs";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-line bg-[var(--color-nav)] sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-12">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-ink text-lg">온강릉</span>
          <span className="text-muted hidden text-[10.5px] tracking-[0.2em] sm:inline">
            GANGNEUNG
          </span>
        </Link>

        {/* 데스크톱에서만 상단 탭. 모바일은 하단 탭바가 받는다. */}
        <nav aria-label="주요 메뉴" className="hidden gap-1 md:flex">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={
                isActiveTab(pathname, tab.href) ? "page" : undefined
              }
              className={
                isActiveTab(pathname, tab.href)
                  ? "text-ink rounded-full px-3 py-2 text-[12.5px] font-bold"
                  : "text-muted hover:text-ink rounded-full px-3 py-2 text-[12.5px]"
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
