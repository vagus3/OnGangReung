"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useMe } from "@/entities/user";
import { useLogout } from "@/features/auth";
import { ThemeToggle } from "@/shared/theme";

import { isActiveTab, NAV_TABS } from "../model/tabs";
import { LanguageMenu } from "./LanguageMenu";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-line bg-[var(--color-nav)] sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-3 px-4 sm:px-12">
        <Link href="/" className="flex flex-shrink-0 items-baseline gap-2">
          <span className="font-display text-ink text-[25px] leading-none">
            온강릉
          </span>
          <span className="text-muted hidden text-[10.5px] tracking-[0.2em] sm:inline">
            GANGNEUNG
          </span>
        </Link>

        {/* 데스크톱에서만 상단 탭. 모바일은 하단 탭바가 받는다. */}
        <nav
          aria-label="주요 메뉴"
          className="hidden min-w-0 flex-1 gap-1 overflow-x-auto md:flex"
        >
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={
                isActiveTab(pathname, tab.href) ? "page" : undefined
              }
              className={
                // 활성 탭은 디자인처럼 채워진 알약이다
                isActiveTab(pathname, tab.href)
                  ? "bg-ink text-paper shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold"
                  : "text-muted hover:text-ink shrink-0 rounded-full px-4 py-2 text-[12.5px]"
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <AiSearch />
          <LanguageMenu />
          <ThemeToggle />
          <AuthLinks />
        </div>
      </div>
    </header>
  );
}

/**
 * 문장을 적어 바로 AI 코스로 보낸다. 디자인 캔버스의 상단 검색창 —
 * 여기서 결과를 만들지 않고 /ai로 문장만 넘긴다. 조합·기간 선택은
 * 그 화면에서 이어간다.
 */
function AiSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed === "") return;
        router.push(`/ai?prompt=${encodeURIComponent(trimmed)}`);
      }}
      className="border-line bg-sand hidden w-[200px] items-center gap-2 rounded-full border px-3 py-2 lg:flex"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="text-muted shrink-0"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="AI에게 물어보기"
        aria-label="AI에게 물어보기"
        className="text-ink min-w-0 flex-1 bg-transparent text-[12.5px] outline-none"
      />
    </form>
  );
}

function AuthLinks() {
  const { data: user, isPending } = useMe();
  const logout = useLogout();

  if (isPending) return null;

  if (user) {
    return (
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="bg-ink text-paper hidden shrink-0 rounded-full px-3 py-2 text-[12.5px] font-bold disabled:opacity-50 sm:block"
      >
        로그아웃
      </button>
    );
  }

  return (
    <div className="hidden shrink-0 items-center gap-2 sm:flex">
      <Link
        href="/auth/login"
        className="border-line text-ink rounded-full border px-3 py-2 text-[12.5px] font-bold"
      >
        로그인
      </Link>
      <Link
        href="/auth/signup"
        className="bg-ink text-paper rounded-full px-3 py-2 text-[12.5px] font-bold"
      >
        회원가입
      </Link>
    </div>
  );
}
