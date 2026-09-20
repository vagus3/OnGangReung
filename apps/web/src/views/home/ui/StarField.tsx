"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number; // 0~1, 컨테이너 비율 좌표 — 리사이즈에도 별이 재배치되지 않는다
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number; // 반짝임 위상, 별마다 어긋나게 둔다
  speed: number;
};

const STAR_COUNT = 140;

function makeStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.1 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.35,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.4,
    });
  }
  return stars;
}

/**
 * 야경 마감 섹션의 별 캔버스. 디자인 캔버스는 이 자리에
 * onStarMove/onStarLeave로 시차를 주는 <canvas>를 깐다 — 그 연출이
 * 구현에서 빠져 있었다(HomeNight.tsx 기존 주석 참고). 마우스를 따라
 * 살짝 움직이는 정도로 가볍게 재현한다.
 *
 * prefers-reduced-motion에서는 반짝임 없이 고정 별만 한 번 그린다.
 */
export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 }); // -1~1
  const targetPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    starsRef.current = makeStars(STAR_COUNT);

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? canvas.clientWidth;
      height = rect?.height ?? canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function draw(elapsedMs: number, drift: { x: number; y: number }) {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const t = elapsedMs / 1000;
      for (const star of starsRef.current) {
        const twinkle = reduceMotion
          ? 0
          : Math.sin(t * star.speed + star.phase) * 0.35;
        const alpha = Math.min(1, Math.max(0, star.baseAlpha + twinkle));
        const px = star.x * width + drift.x * (1 - star.y) * 16;
        const py = star.y * height + drift.y * (1 - star.y) * 10;
        ctx.beginPath();
        ctx.arc(px, py, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(97% 0.01 90 / ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    }

    if (reduceMotion) {
      draw(0, { x: 0, y: 0 });
      ro.disconnect();
      return;
    }

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    function frame(now: number) {
      // 포인터 위치를 살살 따라간다 — 뚝뚝 끊기지 않게 보간
      pointerRef.current.x +=
        (targetPointerRef.current.x - pointerRef.current.x) * 0.06;
      pointerRef.current.y +=
        (targetPointerRef.current.y - pointerRef.current.y) * 0.06;
      if (visible) draw(now, pointerRef.current);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function onPointerMove(e: PointerEvent) {
      const rect = canvas?.parentElement?.getBoundingClientRect();
      if (!rect) return;
      targetPointerRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    }
    function onPointerLeave() {
      targetPointerRef.current = { x: 0, y: 0 };
    }
    const parent = canvas.parentElement;
    parent?.addEventListener("pointermove", onPointerMove);
    parent?.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      parent?.removeEventListener("pointermove", onPointerMove);
      parent?.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1]"
    />
  );
}
