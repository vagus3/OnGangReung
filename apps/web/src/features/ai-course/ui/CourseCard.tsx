import Link from "next/link";

import type { Course } from "@/entities/ai-course";
import { GeoMap } from "@/shared/ui";

export function CourseCard({ course }: { course: Course }) {
  const points = course.days.flatMap((day) =>
    day.items
      .filter((item) => item.lat !== null && item.lng !== null)
      .map((item) => ({
        name: item.spot_name,
        lat: item.lat as number,
        lng: item.lng as number,
        day: day.day,
        meta: item.time_label,
        sub: item.duration_label,
      })),
  );

  return (
    <article className="border-line bg-paper rounded-[20px] border p-5">
      <h3 className="font-display text-ink text-[20px]">{course.title}</h3>
      <p className="text-muted mt-2 text-[12.5px] leading-relaxed">
        {course.summary}
      </p>

      {course.generated_by === "stub" && (
        // 스텁으로 만든 결과를 실제 추천처럼 보이게 두지 않는다
        <p className="border-line text-muted mt-3 rounded-[12px] border border-dashed px-3 py-2 text-[11px]">
          예시 일정입니다. API 키를 넣으면 실제 추천이 동작합니다.
        </p>
      )}

      {points.length > 0 && (
        <div className="mt-5">
          <GeoMap
            label={`${course.title} 동선`}
            mode="days"
            height={260}
            points={points}
          />
        </div>
      )}

      <ol className="mt-5 space-y-5">
        {course.days.map((day) => (
          <li key={day.day}>
            <p className="text-sea text-[10.5px] font-bold tracking-[0.14em]">
              DAY {day.day} · {day.title}
            </p>
            <ul className="border-line mt-2 border-t">
              {day.items.map((item, index) => (
                <li
                  key={`${item.spot_slug}-${index}`}
                  className="border-line flex gap-3 border-b py-3"
                >
                  <span className="text-muted w-16 shrink-0 text-[10.5px] tabular-nums">
                    {item.time_label}
                  </span>
                  <span className="min-w-0">
                    <Link
                      href={`/spots/${item.spot_slug}`}
                      className="text-ink block text-[13px] font-bold"
                    >
                      {item.title}
                    </Link>
                    <span className="text-muted mt-0.5 block text-[11.5px]">
                      {item.duration_label} · {item.reason}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* 디자인은 이동 시간이 시내버스 실시간 배차 기준이라고 적었지만
          그 연동이 없다. 지킬 수 있는 말로 바꾼다 (ADR 009). */}
      <p className="text-muted mt-5 text-[11px] leading-relaxed">
        소요 시간은 직선거리 기준의 어림값입니다. 운영시간과 휴무일은 방문 전
        확인해 주세요.
      </p>
    </article>
  );
}
