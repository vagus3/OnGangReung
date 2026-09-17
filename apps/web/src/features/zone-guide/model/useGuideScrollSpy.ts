"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 여섯 섹션 중 지금 보고 있는 것을 알아낸다.
 *
 * scroll 이벤트로 매번 위치를 재는 대신 IntersectionObserver를 쓴다. 스크롤
 * 핸들러는 프레임마다 돌지만 이건 교차가 바뀔 때만 깨어난다.
 */
export function useGuideScrollSpy(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const setRef = useCallback((index: number) => {
    return (el: HTMLElement | null) => {
      refs.current[index] = el;
    };
  }, []);

  const jump = useCallback((index: number) => {
    refs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const elements = refs.current
      .slice(0, count)
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 화면에 걸친 것 중 가장 위에 있는 섹션을 현재로 본다
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first === undefined) return;

        const index = refs.current.indexOf(first.target as HTMLElement);
        if (index !== -1) setActiveIndex(index);
      },
      // 상단 고정 헤더(64px)와 목차 여백만큼 위를 깎는다
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((el) => {
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
    };
  }, [count]);

  return { setRef, jump, activeIndex };
}
