"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  aiCourseApi,
  aiCourseKeys,
  type Course,
  type CourseRequest,
} from "@/entities/ai-course";
import { useMe } from "@/entities/user";
import { CourseCard, CourseWizard, PRESETS } from "@/features/ai-course";
import { QueryFeedback } from "@/shared/ui";

import { AiAtmosphere } from "./AiAtmosphere";
import { AiNavRail } from "./AiNavRail";

const DISCLAIMER =
  "AI 추천 일정은 실제 영업시간 및 현장 상황과 다를 수 있습니다.";

export function AiCoursePage() {
  const { data: user } = useMe();
  return <AiCourseWorkspace key={user?.id ?? "guest"} userId={user?.id} />;
}

function AiCourseWorkspace({ userId }: { userId?: number }) {
  // 상단 검색창(SiteHeader의 AiSearch)이 문장을 여기로 넘길 때 쓴다.
  // 값만 채우고 전송은 사용자가 직접 하게 둔다 — 관심사·기간을 아직
  // 고르지 않았을 수 있어서다.
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [prompt, setPrompt] = useState(() => searchParams.get("prompt") ?? "");
  const queryClient = useQueryClient();

  const historyKey = aiCourseKeys.history(userId);
  const history = useQuery({
    queryKey: historyKey,
    enabled: userId !== undefined,
    queryFn: aiCourseApi.history,
    retry: false,
  });

  const create = useMutation({
    mutationFn: (body: CourseRequest) => aiCourseApi.create(body),
    onSuccess: (course) => {
      setCourses((prev) => [course, ...prev]);
      setPrompt("");
      void queryClient.invalidateQueries({ queryKey: historyKey });
    },
  });

  const historyItems = history.data ?? [];
  const empty = courses.length === 0;
  // 디자인 캔버스도 기본값이 열린 상태다 (sidebarOpen: true).
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="ai-workspace relative isolate min-h-[calc(100svh-4rem)] overflow-hidden text-white">
      <div className="ai-caustic" aria-hidden="true" />
      <div className="ai-scrim" aria-hidden="true" />
      <AiAtmosphere />
      <AiNavRail />

      <div className="relative z-10 mx-auto flex max-w-[1360px]">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="기록 열기"
            title="기록 열기"
            className="absolute top-6 left-4 z-20 hidden size-10 items-center justify-center rounded-full border border-white/30 bg-white/14 backdrop-blur transition hover:bg-white/25 lg:flex"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        )}
        {/* 대화 사이드바. 디자인 캔버스는 이 자리에 '새 코스 만들기'와
            최근 대화를 둔다 — 데스크톱에서만 보인다. */}
        <aside
          aria-hidden={!sidebarOpen}
          className={`hidden shrink-0 flex-col gap-5 overflow-hidden bg-[oklch(20%_0.05_250/0.32)] backdrop-blur-[14px] transition-all duration-300 lg:flex ${
            sidebarOpen
              ? "w-[258px] border-r border-white/12 px-5 py-6 opacity-100"
              : "pointer-events-none w-0 border-0 px-0 py-6 opacity-0"
          }`}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="기록 닫기"
              title="기록 닫기"
              className="flex size-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/80 transition hover:bg-white/20"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCourses([]);
              setPrompt("");
            }}
            className="w-full rounded-[12px] border border-white/15 bg-white/8 py-3 text-[13px] font-bold text-white transition hover:bg-white/15"
          >
            + 새 코스 만들기
          </button>

          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/45">
              최근 대화
            </p>
            {userId !== undefined && (history.isPending || history.isError) ? (
              <QueryFeedback label="지난 코스" query={history} />
            ) : historyItems.length === 0 ? (
              <p className="mt-3 text-[12px] leading-relaxed text-white/55">
                {userId === undefined
                  ? "로그인하면 만든 코스가 여기에 쌓입니다."
                  : "아직 만든 코스가 없습니다. 문장을 보내면 여기에 쌓입니다."}
              </p>
            ) : (
              <ul className="mt-3 space-y-1">
                {historyItems.map((course) => (
                  <li key={course.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setCourses((prev) =>
                          prev.some((c) => c.id === course.id)
                            ? prev
                            : [course, ...prev],
                        )
                      }
                      className="w-full rounded-[10px] px-3 py-2.5 text-left transition hover:bg-white/8"
                    >
                      <span className="block truncate text-[12.5px] text-white/85">
                        {course.title}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] text-white/45">
                        {course.duration}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr className="border-white/10" />
          <p className="text-[11px] leading-relaxed text-white/40">
            {DISCLAIMER}
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-10 sm:px-8 lg:py-14">
          <div className="mx-auto w-full max-w-[730px]">
            {empty && (
              <>
                <h1 className="font-display text-center text-[clamp(26px,3.6vw,36px)] leading-tight">
                  어떤 여행을 하고 싶으세요?
                </h1>
                <p className="ai-sub mt-3 text-center text-[13.5px]">
                  문장으로 적어도 되고, 아래에서 골라도 됩니다.
                </p>

                <ul className="mt-9 grid gap-5 sm:grid-cols-2">
                  {PRESETS.map((preset) => (
                    <li key={preset.id}>
                      <button
                        type="button"
                        disabled={create.isPending}
                        onClick={() =>
                          create.mutate({
                            interests: preset.interests,
                            duration: preset.duration,
                            prompt: preset.prompt,
                          })
                        }
                        className="ai-card flex h-full w-full flex-col rounded-[18px] border border-white/12 p-6 text-left transition hover:-translate-y-1 hover:border-white/30 hover:brightness-125 disabled:cursor-not-allowed"
                      >
                        <p className="font-display text-[19px] text-white">
                          {preset.title}
                        </p>
                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/60">
                          {preset.body}
                        </p>
                        <p className="mt-6 text-[11px] text-white/40">
                          {preset.meta}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="my-9 flex items-center gap-4">
                  <span className="h-px flex-1 bg-white/12" />
                  <span className="text-[12px] text-white/50">
                    또는 하나씩 골라볼까요?
                  </span>
                  <span className="h-px flex-1 bg-white/12" />
                </div>

                <CourseWizard
                  isPending={create.isPending}
                  onSubmit={(interests, duration) =>
                    create.mutate({ interests, duration, prompt: "" })
                  }
                />
              </>
            )}

            {create.isPending && (
              <p role="status" className="mt-6 text-[12.5px] text-white/70">
                동선을 계산하는 중입니다…
              </p>
            )}
            {create.isError && (
              <p
                role="alert"
                className="mt-6 text-[12.5px] text-[oklch(72%_0.16_25)]"
              >
                {create.error.message}
              </p>
            )}

            {!empty && (
              <div className="space-y-8">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim() === "") return;
                create.mutate({ interests: [], duration: "1박2일", prompt });
              }}
              className={`mt-10 rounded-[16px] border border-white/12 bg-white/6 px-4 py-3 ${
                empty ? "" : "sticky bottom-20 backdrop-blur md:bottom-4"
              }`}
            >
              <label htmlFor="ai-prompt" className="sr-only">
                하고 싶은 말
              </label>
              <div className="flex items-end gap-3">
                <textarea
                  id="ai-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="예) 부모님과 천천히 걷는 이틀, 계단 적은 곳으로"
                  className="min-w-0 flex-1 resize-none bg-transparent py-1 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={create.isPending || prompt.trim() === ""}
                  className="inline-flex h-10 shrink-0 items-center rounded-full bg-white/15 px-5 text-[12.5px] font-bold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-white/40"
                >
                  전송 →
                </button>
              </div>
            </form>

            <p className="mt-3 text-[11px] text-white/40">{DISCLAIMER}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
