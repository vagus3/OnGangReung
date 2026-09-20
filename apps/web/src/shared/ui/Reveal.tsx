"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  /** 캔버스의 data-reveal-delay. 같은 섹션에서 순서를 줄 때 쓴다. */
  delay?: string;
  className?: string;
  children: ReactNode;
};

// 캔버스 값 그대로 — 뷰포트 86% 지점을 지나면 46px 아래에서 올라온다.
const TRANSITION =
  "opacity .8s cubic-bezier(.2,.7,.3,1), transform .8s cubic-bezier(.2,.7,.3,1)";
const OFFSET = "translateY(46px)";
// top < vh * 0.86 과 같은 지점: 아래쪽 14%를 관찰 영역에서 뺀다.
const ROOT_MARGIN = "0px 0px -14% 0px";

/**
 * 스크롤로 들어오면 한 번 올라오며 나타난다. 캔버스가 홈 전반에 깔아둔
 * data-reveal에 대응한다 — 한 번 드러나면 다시 숨지 않는다.
 *
 * prefers-reduced-motion에서는 처음부터 보이게 둔다.
 */
export function Reveal({ delay = "0s", className, children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: ROOT_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: TRANSITION,
        transitionDelay: delay,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : OFFSET,
      }}
    >
      {children}
    </div>
  );
}
