import type { Festival } from "@/entities/festival";
import { Reveal, SectionHeading } from "@/shared/ui";

import { FestivalRow } from "./FestivalRow";

export function FestivalSection({ festivals }: { festivals: Festival[] }) {
  return (
    // 섹션 껍데기는 홈의 HomeSection이 맡는다.
    <div>
      <Reveal>
        <SectionHeading
          eyebrow="FESTIVAL"
          title="지금 뭐가 열리고 있는지 볼까요?"
        />
        <div className="mt-5 px-4 sm:px-12">
          {festivals.length === 0 ? (
            <p className="text-muted text-[12.5px]">등록된 축제가 없습니다.</p>
          ) : (
            <div className="border-line border-t">
              {festivals.map((festival) => (
                <FestivalRow key={festival.slug} festival={festival} />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
