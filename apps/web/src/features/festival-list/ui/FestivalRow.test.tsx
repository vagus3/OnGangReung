import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Festival } from "@/entities/festival";

import { FestivalRow } from "./FestivalRow";

function festival(over: Partial<Festival> = {}): Festival {
  return {
    id: 1,
    slug: "danoje",
    name: "단오제",
    tagline: "유네스코 인류무형문화유산.",
    when_label: "음력 5월 · 6월경",
    badge: "연례",
    is_now: false,
    zone: "city",
    zone_label: "시내권",
    place: "남대천 단오장",
    ...over,
  };
}

describe("FestivalRow", () => {
  it("이름·기간·소개를 보여준다", () => {
    render(<FestivalRow festival={festival()} />);

    expect(screen.getByText("단오제")).toBeInTheDocument();
    expect(screen.getByText("음력 5월 · 6월경")).toBeInTheDocument();
    expect(screen.getByText(/유네스코/)).toBeInTheDocument();
  });

  it("축제 상세로 연결된다", () => {
    render(<FestivalRow festival={festival()} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/festivals/danoje",
    );
  });

  it("진행 중이면 배지가 채워진다", () => {
    // 상태를 색으로만 전달하지 않도록 배지 문구도 함께 확인한다
    const { rerender } = render(
      <FestivalRow festival={festival({ is_now: true, badge: "NOW" })} />,
    );
    const now = screen.getByText("NOW").className;

    rerender(<FestivalRow festival={festival({ is_now: false })} />);
    const later = screen.getByText("연례").className;

    expect(now).not.toBe(later);
  });

  it("배지가 없으면 그리지 않는다", () => {
    render(<FestivalRow festival={festival({ badge: null })} />);

    expect(screen.queryByText("연례")).not.toBeInTheDocument();
  });
});
