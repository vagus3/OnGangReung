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
import { Button, Card, QueryFeedback, SectionHeading } from "@/shared/ui";

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

  return (
    <main className="ai-workspace min-h-[calc(100svh-4rem)] pb-24 text-white md:pb-12">
      <div className="mx-auto max-w-[1360px] border-b border-white/15 py-14 sm:py-20">
        <SectionHeading
          eyebrow="AI COURSE"
          title="문장 하나로 일정을 짜볼까요?"
          inverse
        />
        <p className="mt-3 max-w-[52ch] px-4 text-[13.5px] leading-relaxed text-white/60 sm:px-12">
          관심사와 기간을 고르거나, 하고 싶은 말을 그대로 적어주세요.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1360px] gap-8 px-4 py-8 sm:px-12 lg:grid-cols-[minmax(0,1fr)_258px] lg:py-12">
        <div className="min-w-0 space-y-8">
          {courses.length === 0 && (
            <>
              <ul className="grid gap-3 sm:grid-cols-2">
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
                      className="block w-full rounded-[20px] border border-white/15 bg-white/8 p-5 text-left transition hover:-translate-y-1 hover:border-white/35 hover:bg-white/12"
                    >
                      <p className="text-[10.5px] text-white/45">
                        {preset.meta}
                      </p>
                      <p className="font-display mt-1.5 text-[19px] text-white">
                        {preset.title}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/55">
                        {preset.body}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>

              <Card className="shadow-[0_30px_80px_rgb(0_0_0/0.24)]">
                <CourseWizard
                  isPending={create.isPending}
                  onSubmit={(interests, duration) =>
                    create.mutate({ interests, duration, prompt: "" })
                  }
                />
              </Card>
            </>
          )}

          {create.isPending && (
            <p role="status" className="text-muted text-[12.5px]">
              코스를 만들고 있습니다…
            </p>
          )}
          {create.isError && (
            <p role="alert" className="text-[12.5px] text-[oklch(55%_0.19_25)]">
              {create.error.message}
            </p>
          )}

          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim() === "") return;
              create.mutate({ interests: [], duration: "1박2일", prompt });
            }}
            className={`border-line bg-paper rounded-[20px] border p-3 text-ink shadow-[0_20px_60px_rgb(0_0_0/0.25)] ${courses.length > 0 ? "sticky bottom-20 md:bottom-4" : "relative"}`}
          >
            <label htmlFor="ai-prompt" className="sr-only">
              하고 싶은 말
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="아이 둘과 1박 2일, 이동은 짧게"
              className="text-ink w-full resize-none bg-transparent px-2 py-1 text-[13px] outline-none"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                disabled={create.isPending || prompt.trim() === ""}
              >
                보내기
              </Button>
            </div>
          </form>
        </div>

        <aside>
          <h2 className="text-[13px] font-bold text-white">지난 코스</h2>
          {userId !== undefined && (history.isPending || history.isError) ? (
            <QueryFeedback label="지난 코스" query={history} />
          ) : historyItems.length === 0 ? (
            <p className="text-muted mt-3 text-[11.5px] leading-relaxed">
              {userId === undefined
                ? "로그인하면 만든 코스가 여기에 남습니다."
                : "아직 만든 코스가 없습니다."}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
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
                    className="border-line hover:border-sea/40 w-full rounded-[14px] border p-3 text-left transition-colors"
                  >
                    <span className="text-ink block text-[12px] font-bold">
                      {course.title}
                    </span>
                    <span className="text-muted mt-0.5 block text-[10.5px]">
                      {course.duration}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
