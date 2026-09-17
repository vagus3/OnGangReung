"use client";

import { QueryFeedback } from "@/shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  useMe,
  userApi,
  userKeys,
  type NotificationUpdate,
} from "@/entities/user";

const ROWS: { key: keyof NotificationUpdate; label: string; hint: string }[] = [
  { key: "weather", label: "날씨", hint: "파고·기상 특보가 바뀔 때" },
  { key: "festival", label: "축제", hint: "저장한 권역의 축제가 열릴 때" },
  { key: "course", label: "코스", hint: "저장한 코스에 변동이 있을 때" },
  { key: "emergency", label: "긴급", hint: "재난·안전 안내" },
  { key: "marketing", label: "혜택 · 이벤트", hint: "광고성 정보 (선택)" },
];

export function MyNotifications() {
  const meQuery = useMe();
  const { data: me } = meQuery;
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (body: NotificationUpdate) => userApi.updateNotifications(body),
    onSuccess: (user) => queryClient.setQueryData(userKeys.me, user),
  });

  if (meQuery.isPending || meQuery.isError)
    return <QueryFeedback label="알림 설정" query={meQuery} />;

  if (me === null || me === undefined) {
    return (
      <p className="text-muted text-[12.5px] leading-relaxed">
        알림은 로그인한 계정에 설정됩니다. 로그인 후 이용해 주세요.
      </p>
    );
  }

  const current = me.notifications;

  return (
    <>
      {save.error && (
        <p role="alert" className="text-muted mb-4 text-[12.5px]">
          {save.error.message}
        </p>
      )}
      <ul className="border-line border-t">
        {ROWS.map((row) => {
          const on = current[row.key];
          return (
            <li
              key={row.key}
              className="border-line flex items-center justify-between gap-4 border-b py-4"
            >
              <span>
                <span className="text-ink block text-[13px] font-bold">
                  {row.label}
                </span>
                <span className="text-muted mt-0.5 block text-[11.5px]">
                  {row.hint}
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={row.label}
                disabled={save.isPending}
                onClick={() => save.mutate({ ...current, [row.key]: !on })}
                className={
                  on
                    ? "bg-sea relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    : "bg-line relative h-6 w-11 shrink-0 rounded-full transition-colors"
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    on
                      ? "bg-paper absolute top-1 left-6 size-4 rounded-full transition-all"
                      : "bg-paper absolute top-1 left-1 size-4 rounded-full transition-all"
                  }
                />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
