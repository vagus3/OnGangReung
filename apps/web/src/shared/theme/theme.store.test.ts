import { beforeEach, describe, expect, it } from "vitest";

import { hydrateTheme, THEME_STORAGE_KEY, useThemeStore } from "./theme.store";

describe("theme store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    useThemeStore.setState({ mode: "system" });
  });

  it("기본값은 system이다", () => {
    expect(useThemeStore.getState().mode).toBe("system");
  });

  it("dark를 고르면 루트에 data-theme이 붙는다", () => {
    useThemeStore.getState().setMode("dark");

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("system을 고르면 속성을 지운다", () => {
    // 속성이 없어야 globals.css의 prefers-color-scheme 블록이 받는다
    useThemeStore.getState().setMode("dark");
    useThemeStore.getState().setMode("system");

    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("고른 값을 저장한다", () => {
    useThemeStore.getState().setMode("light");

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("저장값을 읽어 적용한다", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    expect(hydrateTheme()).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("저장값이 이상하면 system으로 떨어진다", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "보라색");

    expect(hydrateTheme()).toBe("system");
  });

  it("저장값이 없으면 system이다", () => {
    expect(hydrateTheme()).toBe("system");
  });
});
