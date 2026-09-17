"use client";

import { useState } from "react";

import { useMe } from "@/entities/user";
import {
  MyHelp,
  MyNotices,
  MyNotifications,
  MyPolicies,
  MyProfile,
  MySaves,
} from "@/features/my-page";
import { ThemeToggle } from "@/shared/theme";
import { SectionHeading } from "@/shared/ui";

type ViewId =
  "saves" | "profile" | "help" | "noti" | "notice" | "policy" | "settings";

// noUncheckedIndexedAccess가 켜져 있어 비어있지 않은 튜플로 타이핑한다
const VIEWS: [
  { id: ViewId; label: string },
  ...{ id: ViewId; label: string }[],
] = [
  { id: "saves", label: "저장 · 스탬프" },
  { id: "profile", label: "프로필 정보" },
  { id: "help", label: "긴급 · 도움" },
  { id: "noti", label: "알림 설정" },
  { id: "notice", label: "공지사항" },
  { id: "policy", label: "약관 · 정책" },
  { id: "settings", label: "설정" },
];

export function MyPage() {
  const [view, setView] = useState<ViewId>("saves");
  const { data: me } = useMe();

  const current = VIEWS.find((v) => v.id === view) ?? VIEWS[0];

  return (
    <main className="mx-auto max-w-[1360px] pb-24 md:pb-12">
      <div className="border-line border-b py-12">
        <SectionHeading eyebrow="MY" title="내 강릉" />
        <p className="text-muted mt-3 px-4 text-[13.5px] sm:px-12">
          {me === null || me === undefined
            ? "회원가입 · 로그인 해주세요."
            : `${me.nickname} · ${me.email}`}
        </p>
      </div>

      <div className="grid gap-8 px-4 py-8 sm:px-12 lg:grid-cols-[236px_minmax(0,1fr)]">
        <nav aria-label="마이페이지 메뉴">
          <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:block lg:space-y-1 lg:overflow-visible">
            {VIEWS.map((item) => (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={item.id === view ? "page" : undefined}
                  onClick={() => setView(item.id)}
                  className={
                    item.id === view
                      ? "bg-sand text-ink w-full rounded-[14px] px-4 py-3 text-left text-[13px] font-bold whitespace-nowrap"
                      : "text-muted hover:text-ink w-full rounded-[14px] px-4 py-3 text-left text-[13px] whitespace-nowrap"
                  }
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-label={current.label}>
          <h2 className="font-display text-ink mb-5 text-[20px]">
            {current.label}
          </h2>

          {view === "saves" && <MySaves />}
          {view === "profile" && <MyProfile />}
          {view === "help" && <MyHelp />}
          {view === "noti" && <MyNotifications />}
          {view === "notice" && <MyNotices />}
          {view === "policy" && <MyPolicies />}
          {view === "settings" && (
            <div>
              <p className="text-ink text-[13px] font-bold">화면 모드</p>
              <div className="mt-3">
                <ThemeToggle />
              </div>
              <p className="text-muted mt-6 text-[11.5px] leading-relaxed">
                언어 설정은 준비 중입니다. 지금은 한국어만 제공합니다.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
