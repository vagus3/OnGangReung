"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  userApi,
  userKeys,
  type LoginRequest,
  type SignupRequest,
  type User,
} from "@/entities/user";

/** 로그인·가입 후 캐시를 갱신하고 원하는 곳으로 보낸다. */
function useAfterAuth(redirectTo: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async (user: User) => {
    await queryClient.cancelQueries();
    queryClient.clear();
    queryClient.setQueryData(userKeys.me, user);
    router.push(redirectTo);
    // 서버 컴포넌트가 들고 있는 로그인 상태도 다시 읽게 한다
    router.refresh();
  };
}

export function useLogin(redirectTo = "/my") {
  const done = useAfterAuth(redirectTo);
  return useMutation({
    mutationFn: (body: LoginRequest) => userApi.login(body),
    onSuccess: done,
  });
}

export function useSignup(redirectTo = "/my") {
  const done = useAfterAuth(redirectTo);
  return useMutation({
    mutationFn: (body: SignupRequest) => userApi.signup(body),
    onSuccess: done,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: userApi.logout,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      queryClient.setQueryData(userKeys.me, null);
      router.refresh();
    },
  });
}
