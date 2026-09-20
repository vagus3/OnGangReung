"use client";

import { IconMenu, IconMenuItem } from "@/shared/ui";

// 디자인 캔버스의 언어 목록 그대로. 한국어만 실제로 제공하므로 나머지는
// 비활성으로 두고 '준비 중'을 붙인다 — 눌러도 아무 일이 없는 항목을
// 멀쩡한 선택지처럼 보이게 두지 않기 위해서다 (마이페이지 안내와 같은 입장).
const LANGUAGES: ReadonlyArray<{
  code: string;
  label: string;
  ready: boolean;
}> = [
  { code: "KR", label: "한국어", ready: true },
  { code: "EN", label: "English", ready: false },
  { code: "JP", label: "日本語", ready: false },
  { code: "CN", label: "中文", ready: false },
];

function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </svg>
  );
}

export function LanguageMenu() {
  return (
    <IconMenu label="언어" panelWidth={136} icon={<GlobeIcon />}>
      {() =>
        LANGUAGES.map((language) => (
          <IconMenuItem
            key={language.code}
            active={language.ready}
            disabled={!language.ready}
            note={language.ready ? undefined : "준비 중"}
          >
            {language.label}
          </IconMenuItem>
        ))
      }
    </IconMenu>
  );
}
