import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpotMenu } from "./SpotMenu";

describe("SpotMenu", () => {
  it("메뉴가 없으면 그리지 않는다", () => {
    const { container } = render(<SpotMenu menu={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("이름과 가격을 함께 보여준다", () => {
    render(
      <SpotMenu
        menu={[
          { name: "강릉샌드 6입", price: "9,800원" },
          { name: "버터바 4입", price: "8,500원" },
        ]}
      />,
    );

    expect(screen.getByText("강릉샌드 6입")).toBeInTheDocument();
    expect(screen.getByText("9,800원")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
