export const aiCourseKeys = {
  all: ["ai-courses"] as const,
  history: (userId?: number) => ["ai-courses", "history", userId] as const,
};
