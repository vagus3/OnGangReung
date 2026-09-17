import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { Festival } from "@/entities/festival";

import { ZoneGuide } from "./ZoneGuide";

// jsdom에 IntersectionObserver가 없다. 스크롤 스파이는 브라우저 동작이므로
// 여기서는 관찰을 막고 섹션 구성과 권역 전환만 검증한다.
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    },
  );
});

function festival(over: Partial<Festival> = {}): Festival {
  return {
    id: 1,
    slug: "danoje",
    name: "단오제",
    tagline: "소개",
    when_label: "음력 5월",
    badge: null,
    is_now: false,
    zone: "city",
    zone_label: "시내권",
    place: "남대천",
    ...over,
  };
}

describe("ZoneGuide", () => {
  it("여섯 개 섹션을 모두 그린다", () => {
    render(<ZoneGuide festivals={[]} />);

    for (const label of ["날씨", "교통", "숙박", "주차장", "먹거리", "축제"]) {
      expect(screen.getByRole("region", { name: label })).toBeInTheDocument();
    }
  });

  it("처음에는 첫 권역이 선택된다", () => {
    render(<ZoneGuide festivals={[]} />);

    expect(screen.getByRole("button", { name: "경포권" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("권역을 바꾸면 그 권역 콘텐츠로 바뀐다", async () => {
    const user = userEvent.setup();
    render(<ZoneGuide festivals={[]} />);

    expect(screen.getByText(/호수와 해변이 붙어 있습니다/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "대관령권" }));

    expect(
      screen.getByText(/해발 700m 위의 목장과 배추밭/),
    ).toBeInTheDocument();
  });

  it("권역에 맞는 추천 이동 수단에 표시를 단다", async () => {
    // 경포권은 기차, 대관령권은 렌트를 추천한다
    const user = userEvent.setup();
    render(<ZoneGuide festivals={[]} />);

    const transport = screen.getByRole("region", { name: "교통" });
    expect(within(transport).getByText("추천").closest("td")).toHaveTextContent(
      "기차",
    );

    await user.click(screen.getByRole("button", { name: "대관령권" }));
    expect(within(transport).getByText("추천").closest("td")).toHaveTextContent(
      "렌트",
    );
  });

  it("축제는 선택한 권역의 것만 보여준다", async () => {
    const user = userEvent.setup();
    render(
      <ZoneGuide
        festivals={[
          festival({ slug: "city1", name: "시내 축제", zone: "city" }),
          festival({ slug: "jum1", name: "주문진 축제", zone: "jumunjin" }),
        ]}
      />,
    );

    const section = screen.getByRole("region", { name: "축제" });
    expect(
      within(section).getByText("이 권역에 등록된 축제가 없습니다."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "주문진권" }));
    expect(within(section).getByText("주문진 축제")).toBeInTheDocument();
    expect(within(section).queryByText("시내 축제")).not.toBeInTheDocument();
  });

  it("목차로 섹션을 고를 수 있다", () => {
    render(<ZoneGuide festivals={[]} />);

    const index = screen.getByRole("navigation", { name: "안내 목차" });
    expect(within(index).getAllByRole("button")).toHaveLength(6);
  });
});
