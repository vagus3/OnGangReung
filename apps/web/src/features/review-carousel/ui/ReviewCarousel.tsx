"use client";

import { useState } from "react";

import type { ReviewSummary } from "@/entities/review";
import { SectionHeading } from "@/shared/ui";

/** 별점을 별 문자와 숫자 둘 다로 알린다 — 색·기호만으로 전달하지 않는다. */
function Stars({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span
      className="text-sun text-[12px]"
      aria-label={`5점 만점에 ${rating}점`}
    >
      {"★".repeat(stars)}
      <span className="text-line">{"★".repeat(5 - stars)}</span>
    </span>
  );
}

export function ReviewCarousel({ summary }: { summary: ReviewSummary }) {
  const [index, setIndex] = useState(0);

  if (summary.items.length === 0) return null;

  const activeIndex = Math.min(index, summary.items.length - 1);
  const review = summary.items[activeIndex];
  if (review === undefined) return null;

  return (
    <section className="mx-auto max-w-[1360px] py-16 sm:py-24">
      <SectionHeading
        eyebrow={`REVIEWS · 평균 ${summary.average}점`}
        title="다녀온 사람들의 말"
      />

      <div className="mt-5 px-4 sm:px-12">
        <blockquote className="border-line max-w-[760px] rounded-[24px] border bg-[var(--surface-50)] p-7 sm:p-10">
          <Stars rating={review.rating} />
          <p className="font-display text-ink mt-4 text-[clamp(18px,2.5vw,26px)] leading-[1.65]">
            {review.body}
          </p>
          <footer className="text-muted mt-4 text-[11.5px]">
            {review.author_name} · {review.country} · {review.spot_label}
          </footer>
        </blockquote>

        <ul className="mt-4 flex flex-wrap" aria-label="후기 고르기">
          {summary.items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`${i + 1}번째 후기`}
                aria-current={i === activeIndex ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={
                  i === activeIndex
                    ? "bg-ink size-11 rounded-full border-[16px] border-paper"
                    : "bg-line size-11 rounded-full border-[16px] border-paper"
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
