import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("자식을 렌더링한다", () => {
    render(<Card>경포호수</Card>);

    expect(screen.getByText("경포호수")).toBeInTheDocument();
  });

  it("as로 렌더링할 태그를 바꾼다", () => {
    render(
      <Card as="article">
        <h2>안목 커피거리</h2>
      </Card>,
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});
