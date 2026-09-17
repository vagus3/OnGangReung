import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Course } from "@/entities/ai-course";

import { CourseCard } from "./CourseCard";

function course(over: Partial<Course> = {}): Course {
  return {
    id: 1,
    title: "자연 · 맛집 1박2일",
    summary: "바다부터 시장까지.",
    duration: "1박2일",
    generated_by: "claude",
    days: [
      {
        day: 1,
        title: "호수와 바다",
        items: [
          {
            spot_slug: "spot_gyeongpo",
            title: "경포호수 산책",
            time_label: "오전 9:00",
            duration_label: "80분",
            reason: "아침이 가장 조용합니다.",
            spot_name: "경포호수 · 경포대",
            lat: 37.8,
            lng: 128.9,
          },
        ],
      },
    ],
    ...over,
  };
}

describe("CourseCard", () => {
  it("제목과 일정을 보여준다", () => {
    render(<CourseCard course={course()} />);

    expect(
      screen.getByRole("heading", { name: "자연 · 맛집 1박2일" }),
    ).toBeInTheDocument();
    expect(screen.getByText("경포호수 산책")).toBeInTheDocument();
    // DAY 1은 지도 범례에도 나오므로 일정 제목 쪽을 집어 확인한다
    expect(screen.getByText(/DAY 1 · 호수와 바다/)).toBeInTheDocument();
  });

  it("각 칸이 장소 상세로 연결된다", () => {
    render(<CourseCard course={course()} />);

    expect(screen.getByRole("link", { name: "경포호수 산책" })).toHaveAttribute(
      "href",
      "/spots/spot_gyeongpo",
    );
  });

  it("스텁으로 만든 결과임을 감추지 않는다", () => {
    const { rerender } = render(
      <CourseCard course={course({ generated_by: "stub" })} />,
    );
    expect(screen.getByText(/예시 일정입니다/)).toBeInTheDocument();

    rerender(<CourseCard course={course({ generated_by: "claude" })} />);
    expect(screen.queryByText(/예시 일정입니다/)).not.toBeInTheDocument();
  });

  it("실제 이동 시간이 반영되지 않음을 밝힌다", () => {
    // 디자인의 "시내버스 실시간 배차" 문구는 지킬 수 없다 (ADR 009)
    render(<CourseCard course={course()} />);

    expect(
      screen.getByText(/실제 이동 시간을 반영하지 않습니다/),
    ).toBeInTheDocument();
  });
});
