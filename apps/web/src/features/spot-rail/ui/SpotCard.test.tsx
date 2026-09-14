import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Spot } from "@/entities/spot";

import { SpotCard } from "./SpotCard";

function makeSpot(overrides: Partial<Spot> = {}): Spot {
  return {
    id: 1,
    slug: "spot_gyeongpo",
    name: "경포호수 · 경포대",
    zone: "gyeongpo",
    category: "nature",
    span: "std",
    rail: "beach",
    sticker: null,
    editorial_desc: "다섯 개의 달이 뜬다고 전해지는 강릉의 심장.",
    tags: [],
    lat: null,
    lng: null,
    image_url: null,
    thumbnail_url: null,
    ...overrides,
  };
}

describe("SpotCard", () => {
  it("이름과 소개를 보여준다", () => {
    render(<SpotCard spot={makeSpot()} />);

    expect(
      screen.getByRole("heading", { name: "경포호수 · 경포대" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/다섯 개의 달/)).toBeInTheDocument();
  });

  it("카테고리를 한글 라벨로 보여준다", () => {
    render(<SpotCard spot={makeSpot({ category: "cafe" })} />);

    expect(screen.getByText("카페")).toBeInTheDocument();
  });

  it("사진이 없으면 대체 문구를 보여준다", () => {
    render(<SpotCard spot={makeSpot({ image_url: null })} />);

    expect(screen.getByText("사진 준비 중")).toBeInTheDocument();
  });

  it("사진이 있으면 이미지를 렌더링한다", () => {
    render(
      <SpotCard
        spot={makeSpot({ image_url: "http://tong.visitkorea.or.kr/a.jpg" })}
      />,
    );

    expect(screen.queryByText("사진 준비 중")).not.toBeInTheDocument();
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  it("스티커는 있을 때만 보여준다", () => {
    const { rerender } = render(
      <SpotCard spot={makeSpot({ sticker: "다섯 개의 달" })} />,
    );
    expect(screen.getByText("다섯 개의 달")).toBeInTheDocument();

    rerender(<SpotCard spot={makeSpot({ sticker: null })} />);
    expect(screen.queryByText("다섯 개의 달")).not.toBeInTheDocument();
  });

  it("태그가 없으면 태그 목록을 그리지 않는다", () => {
    const { rerender } = render(
      <SpotCard spot={makeSpot({ tags: ["호수", "일출"] })} />,
    );
    expect(screen.getByText("호수")).toBeInTheDocument();

    rerender(<SpotCard spot={makeSpot({ tags: [] })} />);
    expect(screen.queryByText("호수")).not.toBeInTheDocument();
  });

  it("span에 따라 카드 폭이 달라진다", () => {
    // span은 편집자가 정하는 레이아웃 지시다
    const { container, rerender } = render(
      <SpotCard spot={makeSpot({ span: "std" })} />,
    );
    const std = container.innerHTML;

    rerender(<SpotCard spot={makeSpot({ span: "wide" })} />);
    expect(container.innerHTML).not.toBe(std);
  });
});
