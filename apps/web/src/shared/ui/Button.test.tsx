import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("클릭하면 onClick이 호출된다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>저장</Button>);

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disabled면 클릭해도 onClick이 호출되지 않는다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        저장
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("variant에 따라 다른 스타일을 입는다", () => {
    const { rerender } = render(<Button variant="primary">확인</Button>);
    const primary = screen.getByRole("button").className;

    rerender(<Button variant="secondary">확인</Button>);
    const secondary = screen.getByRole("button").className;

    rerender(<Button variant="ghost">확인</Button>);
    const ghost = screen.getByRole("button").className;

    expect(new Set([primary, secondary, ghost]).size).toBe(3);
  });

  it("기본 type이 button이라 폼 안에서 submit되지 않는다", () => {
    render(<Button>확인</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
