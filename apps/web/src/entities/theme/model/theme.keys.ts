export const themeKeys = {
  all: ["themes"] as const,
  list: () => ["themes", "list"] as const,
  detail: (slug: string) => ["themes", "detail", slug] as const,
};
