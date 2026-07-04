import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PostCreateForm } from "./PostCreateForm";

describe("PostCreateForm", () => {
  it("빈 값으로 제출하면 onSubmit이 호출되지 않고 에러 메시지가 보인다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostCreateForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "작성" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
  });

  it("제목과 내용을 입력해 제출하면 onSubmit이 입력값과 함께 호출된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PostCreateForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("제목"), "hello");
    await user.type(screen.getByLabelText("내용"), "world");
    await user.click(screen.getByRole("button", { name: "작성" }));

    expect(onSubmit).toHaveBeenCalledWith({ title: "hello", content: "world" });
  });

  it("isPending이면 제출 버튼이 비활성화된다", () => {
    render(<PostCreateForm onSubmit={vi.fn()} isPending />);

    expect(screen.getByRole("button", { name: "작성" })).toBeDisabled();
  });
});
