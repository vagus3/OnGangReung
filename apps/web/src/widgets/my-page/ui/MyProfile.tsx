"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import { useMe, userApi, userKeys, type ProfileUpdate } from "@/entities/user";
import { AuthField, useLogout } from "@/features/auth";
import { Button, QueryFeedback } from "@/shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function SignedOut() {
  return (
    <div className="bg-sand rounded-[20px] p-6">
      <p className="text-ink text-[13.5px] leading-relaxed">
        로그인하면 만든 AI 코스를 다시 확인할 수 있습니다.
      </p>
      <p className="text-muted mt-2 text-[12px]">
        저장한 장소와 스탬프는 이 브라우저에 보관됩니다.
      </p>
      <div className="mt-5 flex gap-2">
        <Link
          href="/auth/login"
          className="border-line text-ink inline-flex h-11 items-center rounded-[14px] border px-4 text-[12.5px]"
        >
          로그인
        </Link>
        <Link
          href="/auth/signup"
          className="bg-sea text-paper inline-flex h-11 items-center rounded-[14px] px-4 text-[12.5px] font-bold"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}

export function MyProfile() {
  const meQuery = useMe();
  const { data: me, isLoading } = meQuery;
  const logout = useLogout();
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: (body: ProfileUpdate) => userApi.updateProfile(body),
    onSuccess: (user) => queryClient.setQueryData(userKeys.me, user),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdate>({
    values: {
      nickname: me?.nickname ?? "",
      phone: me?.phone ?? null,
      home_region: me?.home_region ?? null,
      travel_style: me?.travel_style ?? null,
    },
  });

  if (meQuery.isError) return <QueryFeedback label="프로필" query={meQuery} />;
  if (isLoading) {
    return <p className="text-muted text-[12.5px]">불러오는 중입니다…</p>;
  }
  if (me === null || me === undefined) return <SignedOut />;

  return (
    <div>
      <p className="text-muted text-[12px]">{me.email}</p>

      <form
        onSubmit={handleSubmit((data) => save.mutate(data))}
        className="mt-5 space-y-5"
        noValidate
      >
        <AuthField
          id="profile-nickname"
          label="이름 · 닉네임"
          error={errors.nickname?.message}
          {...register("nickname", { required: "이름을 입력하세요" })}
        />
        <AuthField id="profile-phone" label="연락처" {...register("phone")} />
        <AuthField
          id="profile-home"
          label="거주 지역"
          {...register("home_region")}
        />
        <AuthField
          id="profile-style"
          label="여행 성향"
          {...register("travel_style")}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "저장 중…" : "저장"}
          </Button>
          {save.isSuccess && (
            <span role="status" className="text-muted text-[11.5px]">
              저장했습니다
            </span>
          )}
        </div>
      </form>

      {(save.error || logout.error) && (
        <p role="alert" className="text-muted mt-4 text-[12.5px]">
          {save.error?.message ?? logout.error?.message}
        </p>
      )}
      <button
        type="button"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
        className="text-muted hover:text-ink mt-8 text-[12px] underline"
      >
        로그아웃
      </button>
    </div>
  );
}
