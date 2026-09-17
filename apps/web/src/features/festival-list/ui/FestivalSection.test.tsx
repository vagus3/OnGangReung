import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Festival } from "@/entities/festival";

import { FestivalSection } from "./FestivalSection";

const base: Festival = {
  id: 1,
  slug: "danoje",
  name: "단오제",
  tagline: "소개",
  when_label: "음력 5월",
  badge: null,
  is_now: false,
  zone: "city",
  zone_label: "시내권",
  place: "남대천",
};

describe("FestivalSection", () => {
  it("제목과 축제를 보여준다", () => {
    render(<FestivalSection festivals={[base]} />);

    expect(
      screen.getByRole("heading", { name: "지금 뭐가 열리고 있는지 볼까요?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("단오제")).toBeInTheDocument();
  });

  it("비어 있으면 안내 문구를 보여준다", () => {
    render(<FestivalSection festivals={[]} />);

    expect(screen.getByText("등록된 축제가 없습니다.")).toBeInTheDocument();
  });
});
