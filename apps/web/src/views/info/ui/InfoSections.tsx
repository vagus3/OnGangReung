"use client";

import { useQuery } from "@tanstack/react-query";

import { festivalApi, festivalKeys } from "@/entities/festival";
import { QueryFeedback } from "@/shared/ui";
import { ZoneGuide } from "@/widgets/zone-guide";

export function InfoSections() {
  const festivals = useQuery({
    queryKey: festivalKeys.list(),
    queryFn: () => festivalApi.list(),
  });

  return (
    <>
      {!festivals.data && <QueryFeedback label="축제 정보" query={festivals} />}
      <ZoneGuide
        festivals={festivals.data ?? []}
        festivalsUnavailable={festivals.isError}
      />
    </>
  );
}
