"use client";

import { useEffect, type ReactNode } from "react";

import { IconMenu, IconMenuItem } from "@/shared/ui";

import { hydrateTheme, useThemeStore, type ThemeMode } from "./theme.store";

// 디자인 캔버스의 아이콘을 그대로 옮긴다 (stroke-width 1.7, 15px).
function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M2 19h20" />
    </svg>
  );
}

const OPTIONS = [
  { mode: "dark", label: "다크 모드", icon: <MoonIcon /> },
  { mode: "light", label: "화이트 모드", icon: <SunIcon /> },
  { mode: "system", label: "시스템 설정", icon: <MonitorIcon /> },
] as const satisfies ReadonlyArray<{
  mode: ThemeMode;
  label: string;
  icon: ReactNode;
}>;

// 저장값이 비어도 시스템 설정으로 떨어지므로 항상 하나는 잡힌다
const SYSTEM_OPTION = OPTIONS[2];

/**
 * 화면 모드 전환. 디자인 캔버스와 같은 형태 — 현재 모드 아이콘 하나를
 * 원형 버튼으로 두고, 누르면 세 모드를 담은 패널이 열린다.
 */
export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  // 저장값 반영을 마운트 이후로 미룬다. 서버 렌더링 결과와 첫 클라이언트
  // 렌더링이 어긋나면 hydration 오류가 난다.
  useEffect(() => {
    hydrateTheme();
  }, []);

  const current =
    OPTIONS.find((option) => option.mode === mode) ?? SYSTEM_OPTION;

  return (
    <IconMenu label="화면 모드" panelWidth={158} icon={current.icon}>
      {(close) =>
        OPTIONS.map((option) => (
          <IconMenuItem
            key={option.mode}
            icon={option.icon}
            active={option.mode === mode}
            onClick={() => {
              setMode(option.mode);
              close();
            }}
          >
            {option.label}
          </IconMenuItem>
        ))
      }
    </IconMenu>
  );
}
