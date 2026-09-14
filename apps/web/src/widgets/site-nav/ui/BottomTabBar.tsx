"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveTab, NAV_TABS } from "../model/tabs";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="border-line bg-[var(--color-nav)] fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden"
    >
      <ul className="flex">
        {NAV_TABS.map((tab) => (
          <li key={tab.href} className="flex-1">
            <Link
              href={tab.href}
              aria-current={
                isActiveTab(pathname, tab.href) ? "page" : undefined
              }
              className={
                isActiveTab(pathname, tab.href)
                  ? "text-ink flex h-14 items-center justify-center text-[11.5px] font-bold"
                  : "text-muted flex h-14 items-center justify-center text-[11.5px]"
              }
            >
              {tab.shortLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
