import { CENTERS } from "@/entities/content";
import { Accordion } from "@/shared/ui";

/**
 * 관광안내소.
 *
 * v3 디자인이 마크업을 지웠지만 데이터와 아코디언 설계는 남아 있었다.
 * 관광 앱에서 안내소 위치와 전화번호는 실제로 쓰이는 정보라 되살린다.
 */
export function GuideCenters() {
  return (
    <Accordion
      label="관광안내소"
      defaultOpenId={CENTERS[0]?.id}
      items={CENTERS.map((center) => ({
        id: center.id,
        meta: center.hours,
        title: center.name,
        body: (
          <div className="space-y-2">
            <p className="text-muted text-[12px]">{center.address}</p>
            <p className="text-muted text-[12px]">{center.note}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${center.tel}`}
                className="bg-sea text-paper inline-flex h-9 items-center rounded-full px-3 text-[11.5px] font-bold"
              >
                {center.tel} 전화
              </a>
              {/* 휠체어 대여 여부를 아이콘이 아니라 문구로 알린다 */}
              <span
                className={
                  center.wheelchair
                    ? "border-line text-ink rounded-full border px-3 py-1.5 text-[10.5px]"
                    : "text-muted rounded-full px-3 py-1.5 text-[10.5px]"
                }
              >
                {center.wheelchair
                  ? "휠체어 · 전동 보조기기 대여"
                  : "보조기기 대여 없음"}
              </span>
            </div>
          </div>
        ),
      }))}
    />
  );
}
