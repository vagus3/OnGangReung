"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import type { LoginRequest } from "@/entities/user";
import { Button } from "@/shared/ui";

import { AuthField } from "./AuthField";

type Props = {
  onSubmit: (data: LoginRequest) => void;
  isPending?: boolean;
  errorMessage?: string;
};

export function LoginForm({
  onSubmit,
  isPending = false,
  errorMessage,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <AuthField
        id="login-email"
        label="이메일"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", { required: "이메일을 입력하세요" })}
      />
      <AuthField
        id="login-password"
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password", { required: "비밀번호를 입력하세요" })}
      />

      {errorMessage !== undefined && (
        <p role="alert" className="text-[12.5px] text-[oklch(55%_0.19_25)]">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "확인 중…" : "로그인"}
      </Button>

      <p className="text-muted text-[12px]">
        아직 계정이 없으신가요?{" "}
        <Link href="/auth/signup" className="text-sea">
          회원가입
        </Link>
      </p>
    </form>
  );
}
