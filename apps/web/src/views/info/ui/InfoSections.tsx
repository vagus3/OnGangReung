"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { ZoneGuide } from "@/features/zone-guide";

export function InfoSections() {
  const { data: festivals } = useSuspenseQuery({
    queryKey: festivalKeys.list(),
    queryFn: () => festivalApi.list(),
  });

  return <ZoneGuide festivals={festivals} />;
}
