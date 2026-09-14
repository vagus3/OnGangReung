import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Spot } from "@/entities/spot";

import { SpotRail } from "./SpotRail";

function makeSpot(slug: string, name: string): Spot {
  return {
    id: 1,
    slug,
    name,
    zone: "gyeongpo",
    category: "nature",
    span: "std",
    rail: "beach",
    sticker: null,
    editorial_desc: "설명",
    tags: [],
    lat: null,
    lng: null,
    image_url: null,
    thumbnail_url: null,
  };
}

describe("SpotRail", () => {
  it("제목과 항목을 보여준다", () => {
    render(
      <SpotRail
        title="파도 소리를 기준으로 골라봐요"
        spots={[makeSpot("a", "경포해변"), makeSpot("b", "안목해변")]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "파도 소리를 기준으로 골라봐요" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("비어 있으면 레일 대신 안내 문구를 보여준다", () => {
    render(<SpotRail title="해변" spots={[]} />);

    expect(screen.getByText("아직 등록된 곳이 없습니다.")).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "해변" }),
    ).not.toBeInTheDocument();
  });

  it("빈 문구를 바꿀 수 있다", () => {
    render(<SpotRail title="해변" spots={[]} emptyMessage="준비 중입니다." />);

    expect(screen.getByText("준비 중입니다.")).toBeInTheDocument();
  });

  it("eyebrow는 있을 때만 보여준다", () => {
    const { rerender } = render(
      <SpotRail eyebrow="BEACH" title="해변" spots={[]} />,
    );
    expect(screen.getByText("BEACH")).toBeInTheDocument();

    rerender(<SpotRail title="해변" spots={[]} />);
    expect(screen.queryByText("BEACH")).not.toBeInTheDocument();
  });
});
