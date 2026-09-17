import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";

export type User = components["schemas"]["UserRead"];
export type SignupRequest = components["schemas"]["SignupRequest"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type ProfileUpdate = components["schemas"]["ProfileUpdate"];
export type NotificationUpdate = components["schemas"]["NotificationUpdate"];

export const userApi = {
  /** 로그인하지 않았으면 null. 401은 오류가 아니라 정상 상태다. */
  me: async (): Promise<User | null> => {
    const { data, error, response } = await apiClient.GET("/api/v1/auth/me");
    if (error !== undefined) {
      if (response.status === 401) return null;
      throw toApiError(error, "로그인 정보를 확인하지 못했습니다");
    }
    return data;
  },

  signup: async (body: SignupRequest): Promise<User> => {
    const { data, error } = await apiClient.POST("/api/v1/auth/signup", {
      body,
    });
    if (error !== undefined) throw toApiError(error, "가입하지 못했습니다");
    return data;
  },

  login: async (body: LoginRequest): Promise<User> => {
    const { data, error } = await apiClient.POST("/api/v1/auth/login", {
      body,
    });
    if (error !== undefined) throw toApiError(error, "로그인하지 못했습니다");
    return data;
  },

  logout: async (): Promise<void> => {
    const { error } = await apiClient.POST("/api/v1/auth/logout");
    if (error !== undefined) throw toApiError(error, "로그아웃하지 못했습니다");
  },

  updateProfile: async (body: ProfileUpdate): Promise<User> => {
    const { data, error } = await apiClient.PATCH("/api/v1/auth/me", { body });
    if (error !== undefined)
      throw toApiError(error, "프로필을 저장하지 못했습니다");
    return data;
  },

  updateNotifications: async (body: NotificationUpdate): Promise<User> => {
    const { data, error } = await apiClient.PATCH(
      "/api/v1/auth/me/notifications",
      {
        body,
      },
    );
    if (error !== undefined)
      throw toApiError(error, "알림 설정을 저장하지 못했습니다");
    return data;
  },
};
