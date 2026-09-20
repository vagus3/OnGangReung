import "@testing-library/jest-dom/vitest";

// jsdom에 없는 브라우저 API를 채운다. 컴포넌트가 잘못 쓴 게 아니라
// 테스트 환경이 비어 있는 쪽이라 여기서 메운다.
//
// - matchMedia: prefers-reduced-motion을 읽는 연출 컴포넌트들
//   (Reveal, StarField, AiAtmosphere)
// - IntersectionObserver: 화면에 들어올 때 한 번 드러나는 Reveal
// - ResizeObserver: 캔버스 크기를 따라가는 StarField, AiAtmosphere

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false, // 테스트는 모션을 켠 상태를 기본으로 본다
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

/**
 * 관찰하자마자 "보인다"고 알린다. 가만히 있으면 Reveal이 계속
 * opacity:0으로 남아, 테스트가 사용자에게 보이지 않는 상태를 검사하게 된다.
 */
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe = (target: Element): void => {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  };
  unobserve = (): void => {};
  disconnect = (): void => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
}

class ResizeObserverStub {
  observe = (): void => {};
  unobserve = (): void => {};
  disconnect = (): void => {};
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}
