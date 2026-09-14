"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { spotApi, spotKeys } from "@/entities/spot";
import { ZoneGuide } from "@/features/zone-guide";

export function InfoSections() {
  const { data: spots } = useSuspenseQuery({
    queryKey: spotKeys.list({ limit: 100 }),
    queryFn: () => spotApi.list({ limit: 100 }),
  });

  return <ZoneGuide spots={spots} />;
}
