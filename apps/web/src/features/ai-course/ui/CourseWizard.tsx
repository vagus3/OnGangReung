"use client";

import { useState } from "react";

import { Button, Chip } from "@/shared/ui";

import { DURATIONS, INTERESTS } from "../model/constants";

type Props = {
  onSubmit: (interests: string[], duration: string) => void;
  isPending?: boolean;
};

/** 디자인의 2단계 위저드 — 관심사 고르고 기간 고르기. */
export function CourseWizard({ onSubmit, isPending = false }: Props) {
  const [phase, setPhase] = useState<"interests" | "duration">("interests");
  const [interests, setInterests] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>("1박2일");

  function toggle(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  if (phase === "interests") {
    return (
      <div>
        <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
          STEP 1
        </p>
        <h3 className="font-display text-ink mt-2 text-[20px]">
          무엇을 보고 싶으세요?
        </h3>

        <ul className="mt-5 flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <li key={item}>
              <Chip
                selected={interests.includes(item)}
                onClick={() => toggle(item)}
              >
                {item}
              </Chip>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Button
            onClick={() => setPhase("duration")}
            disabled={interests.length === 0}
          >
            {interests.length === 0
              ? "관심사를 하나 이상 골라주세요"
              : "다음 →"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
        STEP 2
      </p>
      <h3 className="font-display text-ink mt-2 text-[20px]">며칠 머무세요?</h3>

      <ul className="mt-5 flex flex-wrap gap-2">
        {DURATIONS.map((item) => (
          <li key={item}>
            <Chip
              selected={duration === item}
              onClick={() => setDuration(item)}
            >
              {item}
            </Chip>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => setPhase("interests")}>
          ← 이전
        </Button>
        <Button
          onClick={() => onSubmit(interests, duration)}
          disabled={isPending}
        >
          {isPending ? "만드는 중…" : "코스 만들기"}
        </Button>
      </div>
    </div>
  );
}
