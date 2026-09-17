"use client";

import { SignupForm, useSignup } from "@/features/auth";

import { AuthShell } from "./AuthShell";

export function SignupPage() {
  const signup = useSignup();

  return (
    <AuthShell
      eyebrow="SIGN UP"
      title="강릉을 저장해 두세요"
      lead="가입하지 않아도 앱은 전부 쓸 수 있습니다. 로그인하면 저장한 장소와 스탬프가 기기 간에 그대로 남습니다."
    >
      <SignupForm
        onSubmit={(data) => signup.mutate(data)}
        isPending={signup.isPending}
        errorMessage={signup.error?.message}
      />
    </AuthShell>
  );
}
