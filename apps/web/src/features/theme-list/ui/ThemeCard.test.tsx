import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Theme } from "@/entities/theme";

import { ThemeCard } from "./ThemeCard";

const theme: Theme = {
  id: 1,
  slug: "bread",
  name: "빵지순례",
  name_en: "BREAD ROUTE",
  tagline: "마늘빵과 감자빵을 하루에 다 돕니다.",
  season: "사계절",
  car_note: "차 없이 가능",
};

describe("ThemeCard", () => {
  it("테마 상세로 연결된다", () => {
    render(<ThemeCard theme={theme} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/theme/bread");
  });

  it("이름과 한 줄 소개를 보여준다", () => {
    render(<ThemeCard theme={theme} />);

    expect(
      screen.getByRole("heading", { name: "빵지순례" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/마늘빵과 감자빵/)).toBeInTheDocument();
  });

  it("계절과 차량 안내를 칩으로 보여준다", () => {
    render(<ThemeCard theme={theme} />);

    expect(screen.getByText("사계절")).toBeInTheDocument();
    expect(screen.getByText("차 없이 가능")).toBeInTheDocument();
  });
});
