import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ReviewSummary } from "@/entities/review";

import { ReviewCarousel } from "./ReviewCarousel";

const summary: ReviewSummary = {
  count: 2,
  average: 4.5,
  items: [
    {
      id: 1,
      author_name: "Sarah M.",
      country: "미국",
      rating: 5,
      body: "경포호수 일출이 아름다웠어요.",
      spot_label: "경포호수",
      helpful_count: 12,
    },
    {
      id: 2,
      author_name: "이현우",
      country: "한국",
      rating: 4,
      body: "무장애길을 끝까지 걸었습니다.",
      spot_label: "경포해변",
      helpful_count: 26,
    },
  ],
};

describe("ReviewCarousel", () => {
  it("첫 후기를 보여준다", () => {
    render(<ReviewCarousel summary={summary} />);

    expect(screen.getByText(/경포호수 일출/)).toBeInTheDocument();
    expect(screen.getByText(/Sarah M./)).toBeInTheDocument();
  });

  it("평균 점수를 제목에 싣는다", () => {
    render(<ReviewCarousel summary={summary} />);

    expect(screen.getByText(/평균 4.5점/)).toBeInTheDocument();
  });

  it("별점을 읽을 수 있는 이름으로도 준다", () => {
    // 별 기호만으로는 스크린리더가 점수를 전달하지 못한다
    render(<ReviewCarousel summary={summary} />);

    expect(screen.getByLabelText("5점 만점에 5점")).toBeInTheDocument();
  });

  it("점을 누르면 다른 후기로 바뀐다", async () => {
    const user = userEvent.setup();
    render(<ReviewCarousel summary={summary} />);

    await user.click(screen.getByRole("button", { name: "2번째 후기" }));

    expect(screen.getByText(/무장애길/)).toBeInTheDocument();
    expect(screen.queryByText(/경포호수 일출/)).not.toBeInTheDocument();
  });

  it("후기가 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(
      <ReviewCarousel summary={{ count: 0, average: 0, items: [] }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
