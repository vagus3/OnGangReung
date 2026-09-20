"use client";

import { useState } from "react";

import type { CourseRequest } from "@/entities/ai-course";
import { Chip } from "@/shared/ui";

import { DURATIONS, INTERESTS } from "../model/constants";

type Props = {
  onSubmit: (
    interests: string[],
    duration: NonNullable<CourseRequest["duration"]>,
  ) => void;
  isPending?: boolean;
};

/**
 * 디자인 캔버스의 2단계 위저드. 어두운 AI 코스 화면 위에 얹히는
 * 가운데 정렬 패널이다 — STEP 라벨, 질문, 칩, 하단 CTA 순.
 */
export function CourseWizard({ onSubmit, isPending = false }: Props) {
  const [phase, setPhase] = useState<"interests" | "duration">("interests");
  const [interests, setInterests] = useState<string[]>([]);
  const [duration, setDuration] =
    useState<NonNullable<CourseRequest["duration"]>>("1박2일");

  function toggle(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  const onInterests = phase === "interests";

  return (
    <div className="rounded-[20px] border border-white/12 bg-white/5 px-6 py-8 text-center sm:px-10">
      <p className="text-[11px] font-bold tracking-[0.22em] text-white/55">
        {onInterests ? "STEP 1 · 관심사 (복수 선택)" : "STEP 2 · 기간"}
      </p>
      <p className="mt-2.5 text-[14px] text-white/85">
        {onInterests
          ? "강릉에서 어떤 경험을 하고 싶으세요?"
          : "얼마나 머무르시나요?"}
      </p>

      <ul className="mt-6 flex flex-wrap justify-center gap-3">
        {(onInterests ? INTERESTS : DURATIONS).map((item) => (
          <li key={item}>
            <Chip
              tone="onDark"
              selected={
                onInterests ? interests.includes(item) : duration === item
              }
              onClick={() =>
                onInterests
                  ? toggle(item)
                  : setDuration(item as NonNullable<CourseRequest["duration"]>)
              }
            >
              {item}
            </Chip>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {!onInterests && (
          <button
            type="button"
            onClick={() => setPhase("interests")}
            className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-[13px] text-white/80 transition hover:bg-white/10"
          >
            ← 이전
          </button>
        )}
        <button
          type="button"
          disabled={(onInterests && interests.length === 0) || isPending}
          onClick={() =>
            onInterests ? setPhase("duration") : onSubmit(interests, duration)
          }
          className="inline-flex h-11 items-center rounded-full bg-white/15 px-6 text-[13px] font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/45"
        >
          {onInterests
            ? interests.length === 0
              ? "관심사를 하나 이상 골라주세요"
              : "다음 →"
            : isPending
              ? "만드는 중…"
              : "코스 만들기"}
        </button>
      </div>
    </div>
  );
}
