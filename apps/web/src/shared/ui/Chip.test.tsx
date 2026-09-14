import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "./Chip";

describe("Chip", () => {
  it("선택 상태를 aria-pressed로 전달한다", () => {
    const { rerender } = render(<Chip selected>자연</Chip>);
    expect(screen.getByRole("button", { name: "자연" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    rerender(<Chip>자연</Chip>);
    expect(screen.getByRole("button", { name: "자연" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Chip onClick={onClick}>카페</Chip>);

    await user.click(screen.getByRole("button", { name: "카페" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("선택 여부에 따라 스타일이 달라진다", () => {
    const { rerender } = render(<Chip selected>맛집</Chip>);
    const on = screen.getByRole("button").className;

    rerender(<Chip>맛집</Chip>);
    const off = screen.getByRole("button").className;

    expect(on).not.toBe(off);
  });
});
