import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "ongangreung-theme";

type ThemeStore = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

// 루트의 data-theme 속성 하나로 전환된다. 속성이 없으면 시스템 설정을 따르므로
// system 모드에서는 지운다 (globals.css의 prefers-color-scheme 블록이 받는다).
function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

function readStored(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    // 사생활 보호 모드 등에서 접근이 막힐 수 있다. 기본값으로 떨어진다.
    return "system";
  }
}

export const useThemeStore = create<ThemeStore>((set) => ({
  // 서버 렌더링과 첫 클라이언트 렌더링이 어긋나면 안 되므로 항상 system으로
  // 시작하고, 저장값 반영은 ThemeToggle의 마운트 시점에 한다.
  mode: "system",
  setMode: (mode) => {
    applyTheme(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // 저장 실패는 무시한다 — 이번 세션에는 적용된 상태로 남는다
    }
    set({ mode });
  },
}));

export function hydrateTheme(): ThemeMode {
  const stored = readStored();
  applyTheme(stored);
  useThemeStore.setState({ mode: stored });
  return stored;
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
