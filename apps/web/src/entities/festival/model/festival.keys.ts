import type { Zone } from "@/entities/spot";

export const festivalKeys = {
  all: ["festivals"] as const,
  list: (zone?: Zone) => ["festivals", "list", zone ?? null] as const,
  detail: (slug: string) => ["festivals", "detail", slug] as const,
};
