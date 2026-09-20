"use client";

import { useEffect, useRef } from "react";

// 디자인 캔버스의 initCanvas() 값을 그대로 옮긴다.
const BUBBLE_COUNT = 34;
const MAX_RIPPLES = 26;
const RIPPLE_SPEED = 0.014; // t 증가량 — 1이 되면 사라진다
const RIPPLE_BASE = 6;
const RIPPLE_GROWTH = 78;

type Bubble = { x: number; y: number; r: number; s: number };
type Ripple = { x: number; y: number; t: number; warm: boolean };

/**
 * AI 코스 화면의 물속 연출. 디자인 캔버스는 이 화면에 네 겹을 쌓는다 —
 * 배경 그라데이션, caustic(물결 굴절) 레이어, 파문 캔버스, 마우스를 따르는
 * 글로우. 이 컴포넌트는 그중 움직이는 두 겹(캔버스·글로우)을 맡는다.
 * 나머지 두 겹은 globals.css의 .ai-workspace / .ai-caustic이다.
 *
 * 마우스를 움직이면 물방울이 떨어진 것처럼 원이 퍼진다. 바탕에는 기포가
 * 천천히 떠오른다.
 */
export function AiAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const host = canvas.parentElement;
    if (!host) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const bubbles: Bubble[] = Array.from({ length: BUBBLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.7 + 0.4,
      s: Math.random() * 0.0006 + 0.0002,
    }));
    const ripples: Ripple[] = [];

    function size() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    size();

    function onMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (glow) glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (reduceMotion) return;
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      // 절반 조금 넘게 바다색, 나머지는 커피색 — 강릉의 두 색이다
      ripples.push({ x, y, t: 0, warm: Math.random() > 0.55 });
    }
    host.addEventListener("mousemove", onMove);

    const ro = new ResizeObserver(size);
    ro.observe(host);

    let raf = 0;
    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const b of bubbles) {
        b.y -= b.s;
        if (b.y < 0) b.y = 1;
        ctx.beginPath();
        ctx.arc(b.x * canvas.width, b.y * canvas.height, b.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fill();
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        if (!rp) continue;
        rp.t += RIPPLE_SPEED;
        if (rp.t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const fade = 1 - rp.t;
        const radius = RIPPLE_BASE + rp.t * RIPPLE_GROWTH;

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rp.warm
          ? `rgba(255,196,132,${(0.36 * fade).toFixed(3)})`
          : `rgba(150,214,255,${(0.42 * fade).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 안쪽에 한 겹 더 — 물방울이 퍼질 때 생기는 두 번째 파문
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, radius * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${(0.2 * fade).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-90 mix-blend-screen"
      />
      <div ref={glowRef} aria-hidden="true" className="ai-glow" />
    </>
  );
}
