import type { GuideZoneContent } from "@/entities/guide";

export function GuideEats({ zone }: { zone: GuideZoneContent }) {
  return (
    <ul>
      {zone.eats.map((eat) => (
        <li
          key={eat.name}
          className="border-line grid gap-x-4 gap-y-1 border-t py-4 sm:grid-cols-[minmax(0,1.2fr)_160px_140px_minmax(0,0.9fr)] sm:items-center"
        >
          <div>
            <span className="text-ink text-[13.5px] font-bold">{eat.name}</span>
            <span className="text-muted mt-0.5 block text-[11.5px]">
              {eat.what}
            </span>
          </div>
          <span className="text-muted text-[11.5px]">{eat.hours}</span>
          <span
            className={
              eat.wait === "없음"
                ? "text-muted text-[11.5px]"
                : "text-[11.5px] font-bold text-[oklch(55%_0.19_25)]"
            }
          >
            대기 {eat.wait}
          </span>
          <span className="text-muted text-[11.5px]">주차 {eat.parking}</span>
        </li>
      ))}
    </ul>
  );
}
