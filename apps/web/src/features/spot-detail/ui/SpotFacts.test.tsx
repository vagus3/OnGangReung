import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SpotDetail } from "@/entities/spot";

import { SpotFacts } from "./SpotFacts";

function detail(overrides: Partial<SpotDetail> = {}): SpotDetail {
  return {
    id: 1,
    slug: "s",
    name: "장소",
    zone: "city",
    category: "food",
    span: "std",
    rail: null,
    sticker: null,
    editorial_desc: "설명",
    tags: [],
    lat: null,
    lng: null,
    image_url: null,
    thumbnail_url: null,
    about: null,
    hours: null,
    tip: null,
    parking: null,
    menu: [],
    address: null,
    tel: null,
    homepage: null,
    overview: null,
    tour_content_id: null,
    ...overrides,
  };
}

describe("SpotFacts", () => {
  it("값이 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(<SpotFacts spot={detail()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("있는 항목만 줄로 만든다", () => {
    render(
      <SpotFacts
        spot={detail({ address: "강릉시 교동", hours: "09:00–18:00" })}
      />,
    );

    expect(screen.getByText("주소")).toBeInTheDocument();
    expect(screen.getByText("강릉시 교동")).toBeInTheDocument();
    expect(screen.getByText("운영")).toBeInTheDocument();
    expect(screen.queryByText("전화")).not.toBeInTheDocument();
    expect(screen.queryByText("주차")).not.toBeInTheDocument();
  });

  it("네 항목이 모두 있으면 네 줄이 된다", () => {
    render(
      <SpotFacts
        spot={detail({
          address: "주소",
          hours: "시간",
          tel: "033-0000-0000",
          parking: "무료",
        })}
      />,
    );

    expect(screen.getAllByRole("term")).toHaveLength(4);
  });
});
