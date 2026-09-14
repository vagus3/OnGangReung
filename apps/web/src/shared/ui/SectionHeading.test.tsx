import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("제목을 h2로 렌더링한다", () => {
    render(<SectionHeading title="파도 소리를 기준으로 골라봐요" />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "파도 소리를 기준으로 골라봐요",
      }),
    ).toBeInTheDocument();
  });

  it("level로 제목 단계를 바꾼다", () => {
    render(<SectionHeading title="권역 안내" level={3} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "권역 안내" }),
    ).toBeInTheDocument();
  });

  it("eyebrow는 있을 때만 렌더링한다", () => {
    const { rerender } = render(
      <SectionHeading eyebrow="BEACH" title="해변" />,
    );
    expect(screen.getByText("BEACH")).toBeInTheDocument();

    rerender(<SectionHeading title="해변" />);
    expect(screen.queryByText("BEACH")).not.toBeInTheDocument();
  });
});
