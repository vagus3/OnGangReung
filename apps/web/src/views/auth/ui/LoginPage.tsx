"use client";

import { LoginForm, useLogin } from "@/features/auth";

import { AuthShell } from "./AuthShell";

export function LoginPage() {
  const login = useLogin();

  return (
    <AuthShell
      eyebrow="SIGN IN"
      title="다시 오셨네요"
      lead="로그인하고 만든 AI 코스를 다시 확인하세요. 저장한 장소와 스탬프는 이 브라우저에 보관됩니다."
    >
      <LoginForm
        onSubmit={(data) => login.mutate(data)}
        isPending={login.isPending}
        errorMessage={login.error?.message}
      />
    </AuthShell>
  );
}
