import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CourseWizard } from "./CourseWizard";

describe("CourseWizard", () => {
  it("관심사를 고르기 전에는 다음으로 갈 수 없다", () => {
    render(<CourseWizard onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "관심사를 하나 이상 골라주세요" }),
    ).toBeDisabled();
  });

  it("관심사를 고르면 다음 단계로 넘어간다", async () => {
    const user = userEvent.setup();
    render(<CourseWizard onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "자연" }));
    await user.click(screen.getByRole("button", { name: "다음 →" }));

    expect(screen.getByText("STEP 2")).toBeInTheDocument();
  });

  it("이전으로 돌아가면 고른 관심사가 남아 있다", async () => {
    const user = userEvent.setup();
    render(<CourseWizard onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "맛집" }));
    await user.click(screen.getByRole("button", { name: "다음 →" }));
    await user.click(screen.getByRole("button", { name: "← 이전" }));

    expect(screen.getByRole("button", { name: "맛집" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("고른 값으로 제출한다", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CourseWizard onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "카페" }));
    await user.click(screen.getByRole("button", { name: "다음 →" }));
    await user.click(screen.getByRole("button", { name: "당일치기" }));
    await user.click(screen.getByRole("button", { name: "코스 만들기" }));

    expect(onSubmit).toHaveBeenCalledWith(["카페"], "당일치기");
  });

  it("관심사를 다시 누르면 해제된다", async () => {
    const user = userEvent.setup();
    render(<CourseWizard onSubmit={vi.fn()} />);

    const chip = screen.getByRole("button", { name: "자연" });
    await user.click(chip);
    await user.click(chip);

    expect(chip).toHaveAttribute("aria-pressed", "false");
  });
});
