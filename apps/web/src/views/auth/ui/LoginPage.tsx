"use client";

import { LoginForm, useLogin } from "@/features/auth";

import { AuthShell } from "./AuthShell";

export function LoginPage() {
  const login = useLogin();

  return (
    <AuthShell
      eyebrow="SIGN IN"
      title="다시 오셨네요"
      lead="저장한 장소와 스탬프를 기기 간에 이어서 보려면 로그인하세요."
    >
      <LoginForm
        onSubmit={(data) => login.mutate(data)}
        isPending={login.isPending}
        errorMessage={login.error?.message}
      />
    </AuthShell>
  );
}
