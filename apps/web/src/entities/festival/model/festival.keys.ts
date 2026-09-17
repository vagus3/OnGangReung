import type { components } from "@shg/api-client";
type Zone = components["schemas"]["Zone"];

export const festivalKeys = {
  all: ["festivals"] as const,
  list: (zone?: Zone) => ["festivals", "list", zone ?? null] as const,
  detail: (slug: string) => ["festivals", "detail", slug] as const,
};
