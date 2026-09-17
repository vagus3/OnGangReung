import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GeoMapCanvas } from "./GeoMapCanvas";

const mocks = vi.hoisted(() => ({ popup: vi.fn(), icon: vi.fn() }));
vi.mock("leaflet", () => ({
  default: {
    map: () => ({ fitBounds: vi.fn(), setView: vi.fn(), remove: vi.fn() }),
    tileLayer: () => ({ addTo: vi.fn() }),
    marker: () => ({
      bindPopup: (value: HTMLElement) => {
        mocks.popup(value);
        return { addTo: vi.fn() };
      },
    }),
    divIcon: mocks.icon,
  },
}));

describe("GeoMapCanvas", () => {
  it("renders API values as text instead of executing HTML", () => {
    const text = '<img src=x onerror="alert(1)">';
    render(
      <GeoMapCanvas
        label="지도"
        mode="single"
        points={[
          {
            name: text,
            meta: text,
            sub: text,
            lat: 37.8,
            lng: 128.9,
          },
        ]}
      />,
    );
    const popup = mocks.popup.mock.calls[0]?.[0] as HTMLElement;
    expect(popup.querySelector("img")).toBeNull();
    expect(popup.textContent).toBe(text.repeat(3));
  });
});
