import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ThemeEntry } from "@/entities/theme";

import { ThemeEntryCard } from "./ThemeEntryCard";

function entry(overrides: Partial<ThemeEntry> = {}): ThemeEntry {
  return {
    note: "기차에서 먹을 것을 미리 삽니다.",
    hint: "역 도보 2분",
    spot: {
      id: 1,
      slug: "spot_gangneung_sand",
      name: "강릉샌드 매장",
      zone: "city",
      category: "food",
      span: "std",
      rail: null,
      sticker: null,
      editorial_desc: "장소 자체의 설명",
      tags: [],
      lat: null,
      lng: null,
      image_url: null,
      thumbnail_url: null,
    },
    ...overrides,
  };
}

describe("ThemeEntryCard", () => {
  it("테마 맥락의 서술을 보여준다", () => {
    // note가 spot.editorial_desc보다 앞선다 — 지금 보고 있는 것이 테마다
    render(<ThemeEntryCard entry={entry()} order={1} />);

    expect(
      screen.getByText("기차에서 먹을 것을 미리 삽니다."),
    ).toBeInTheDocument();
    expect(screen.queryByText("장소 자체의 설명")).not.toBeInTheDocument();
  });

  it("장소 상세로 연결된다", () => {
    render(<ThemeEntryCard entry={entry()} order={1} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/spots/spot_gangneung_sand",
    );
  });

  it("순서를 두 자리로 표시한다", () => {
    render(<ThemeEntryCard entry={entry()} order={3} />);

    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("hint는 있을 때만 보여준다", () => {
    const { rerender } = render(<ThemeEntryCard entry={entry()} order={1} />);
    expect(screen.getByText("역 도보 2분")).toBeInTheDocument();

    rerender(<ThemeEntryCard entry={entry({ hint: null })} order={1} />);
    expect(screen.queryByText("역 도보 2분")).not.toBeInTheDocument();
  });

  it("권역 이름을 한글로 보여준다", () => {
    render(<ThemeEntryCard entry={entry()} order={1} />);

    expect(screen.getByText("시내권")).toBeInTheDocument();
  });
});
