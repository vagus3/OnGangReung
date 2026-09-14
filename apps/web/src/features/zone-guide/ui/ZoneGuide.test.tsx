import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Spot } from "@/entities/spot";

import { ZoneGuide } from "./ZoneGuide";

function makeSpot(slug: string, zone: Spot["zone"], name: string): Spot {
  return {
    id: 1,
    slug,
    name,
    zone,
    category: "nature",
    span: "std",
    rail: null,
    sticker: null,
    editorial_desc: "설명",
    tags: [],
    lat: null,
    lng: null,
    image_url: null,
    thumbnail_url: null,
  };
}

const SPOTS = [
  makeSpot("a", "gyeongpo", "경포대"),
  makeSpot("b", "jumunjin", "주문진 수산시장"),
];

describe("ZoneGuide", () => {
  it("처음에는 첫 권역이 선택된다", () => {
    render(<ZoneGuide spots={SPOTS} />);

    expect(screen.getByRole("button", { name: "경포권" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("경포대")).toBeInTheDocument();
  });

  it("선택한 권역의 관광지만 보여준다", () => {
    render(<ZoneGuide spots={SPOTS} />);

    expect(screen.queryByText("주문진 수산시장")).not.toBeInTheDocument();
  });

  it("권역을 바꾸면 목록이 바뀐다", async () => {
    const user = userEvent.setup();
    render(<ZoneGuide spots={SPOTS} />);

    await user.click(screen.getByRole("button", { name: "주문진권" }));

    expect(screen.getByText("주문진 수산시장")).toBeInTheDocument();
    expect(screen.queryByText("경포대")).not.toBeInTheDocument();
  });

  it("해당 권역에 관광지가 없으면 안내 문구를 보여준다", async () => {
    const user = userEvent.setup();
    render(<ZoneGuide spots={SPOTS} />);

    await user.click(screen.getByRole("button", { name: "대관령권" }));

    expect(screen.getByText("아직 등록된 곳이 없습니다.")).toBeInTheDocument();
  });

  it("권역 설명을 함께 보여준다", () => {
    render(<ZoneGuide spots={SPOTS} />);

    expect(screen.getByText("GYEONGPO")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "호수와 해변, 그리고 오죽헌" }),
    ).toBeInTheDocument();
  });
});
