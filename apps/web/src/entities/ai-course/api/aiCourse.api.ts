import type { components } from "@shg/api-client";

import { apiClient, toApiError } from "@/shared/api";

export type Course = components["schemas"]["CourseRead"];
export type CourseRequest = components["schemas"]["CourseRequest"];
export type CourseDay = components["schemas"]["CourseDayRead"];
export type CourseItem = components["schemas"]["CourseItemRead"];

export const aiCourseApi = {
  create: async (body: CourseRequest): Promise<Course> => {
    const { data, error } = await apiClient.POST("/api/v1/ai/courses", {
      body,
    });
    if (error !== undefined)
      throw toApiError(error, "코스를 만들지 못했습니다");
    return data;
  },

  /** 히스토리는 로그인한 사용자의 것만 있다. 비로그인이면 빈 배열. */
  history: async (): Promise<Course[]> => {
    const { data, error, response } = await apiClient.GET("/api/v1/ai/courses");
    if (error !== undefined) {
      if (response.status === 401) return [];
      throw toApiError(error, "히스토리를 불러오지 못했습니다");
    }
    return data;
  },
};
