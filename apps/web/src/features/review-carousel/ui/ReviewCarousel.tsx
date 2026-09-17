"use client";

import { useState } from "react";

import type { ReviewSummary } from "@/entities/review";
import { SectionHeading } from "@/shared/ui";

/** 별점을 별 문자와 숫자 둘 다로 알린다 — 색·기호만으로 전달하지 않는다. */
function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="text-sun text-[12px]"
      aria-label={`5점 만점에 ${rating}점`}
    >
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewCarousel({ summary }: { summary: ReviewSummary }) {
  const [index, setIndex] = useState(0);

  if (summary.items.length === 0) return null;

  const review = summary.items[index] ?? summary.items[0];
  if (review === undefined) return null;

  return (
    <section className="py-12">
      <SectionHeading
        eyebrow={`REVIEWS · 평균 ${summary.average}점`}
        title="다녀온 사람들의 말"
      />

      <div className="mt-5 px-4 sm:px-12">
        <blockquote className="border-line max-w-[60ch] rounded-[20px] border p-6">
          <Stars rating={review.rating} />
          <p className="text-ink mt-3 text-[13.5px] leading-[1.9]">
            {review.body}
          </p>
          <footer className="text-muted mt-4 text-[11.5px]">
            {review.author_name} · {review.country} · {review.spot_label}
          </footer>
        </blockquote>

        <ul className="mt-4 flex gap-2" aria-label="후기 고르기">
          {summary.items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`${i + 1}번째 후기`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={
                  i === index
                    ? "bg-ink size-2.5 rounded-full"
                    : "bg-line size-2.5 rounded-full"
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
