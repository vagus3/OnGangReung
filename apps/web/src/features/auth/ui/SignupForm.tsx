"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import type { SignupRequest } from "@/entities/user";
import { Button } from "@/shared/ui";

import { AuthField } from "./AuthField";

type Props = {
  onSubmit: (data: SignupRequest) => void;
  isPending?: boolean;
  errorMessage?: string;
};

// 받는 항목은 디자인의 profileFields와 개인정보 처리방침 고지에서 왔다.
export function SignupForm({
  onSubmit,
  isPending = false,
  errorMessage,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupRequest>({ defaultValues: { noti_marketing: false } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <AuthField
        id="signup-email"
        label="이메일"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", { required: "이메일을 입력하세요" })}
      />
      <AuthField
        id="signup-password"
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        hint="10자 이상이면 됩니다. 문자 종류는 제한하지 않습니다."
        error={errors.password?.message}
        {...register("password", {
          required: "비밀번호를 입력하세요",
          minLength: { value: 10, message: "10자 이상 입력하세요" },
        })}
      />
      <AuthField
        id="signup-nickname"
        label="이름 · 닉네임"
        autoComplete="nickname"
        error={errors.nickname?.message}
        {...register("nickname", { required: "이름을 입력하세요" })}
      />
      <AuthField
        id="signup-phone"
        label="연락처"
        type="tel"
        autoComplete="tel"
        hint="선택 사항입니다."
        {...register("phone")}
      />

      <div className="bg-sand rounded-[16px] p-4">
        <p className="text-ink text-[11.5px] font-bold">수집하는 정보</p>
        <p className="text-muted mt-1.5 text-[11px] leading-relaxed">
          이름(닉네임), 이메일, 연락처, 저장한 장소 및 방문 스탬프 기록. 코스
          추천 개인화와 저장 목록 동기화에 씁니다. 회원 탈퇴 시 즉시 파기합니다.
        </p>
        <label className="mt-3 flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5"
            {...register("noti_marketing")}
          />
          <span className="text-muted text-[11.5px]">
            (선택) 혜택 · 이벤트 정보를 받겠습니다
          </span>
        </label>
      </div>

      {errorMessage !== undefined && (
        <p role="alert" className="text-[12.5px] text-[oklch(55%_0.19_25)]">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "가입 중…" : "가입하고 시작하기"}
      </Button>

      <p className="text-muted text-[12px]">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="text-sea">
          로그인
        </Link>
      </p>
    </form>
  );
}
