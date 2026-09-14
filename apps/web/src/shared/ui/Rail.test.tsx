import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Rail, RailItem } from "./Rail";

describe("Rail", () => {
  it("label을 접근성 이름으로 쓰고 항목을 담는다", () => {
    render(
      <Rail label="해변">
        <RailItem>경포해변</RailItem>
        <RailItem>안목해변</RailItem>
      </Rail>,
    );

    expect(screen.getByRole("list", { name: "해변" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("키보드로 스크롤할 수 있도록 포커스를 받는다", () => {
    render(
      <Rail label="먹거리">
        <RailItem>초당순두부</RailItem>
      </Rail>,
    );

    expect(screen.getByRole("list", { name: "먹거리" })).toHaveAttribute(
      "tabindex",
      "0",
    );
  });
});
