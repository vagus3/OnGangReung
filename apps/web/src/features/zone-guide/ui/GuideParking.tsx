import type { GuideZoneContent } from "@/entities/guide";
import { GeoMap } from "@/shared/ui";

// 만차 위험은 색과 문구 둘 다로 알린다
function isCrowded(risk: string): boolean {
  return risk.includes("만차");
}

export function GuideParking({ zone }: { zone: GuideZoneContent }) {
  return (
    <div>
      <GeoMap
        label={`${zone.name} 주차장`}
        mode="fee"
        height={360}
        points={zone.parks.map((park) => ({
          name: park.name,
          lat: park.lat,
          lng: park.lng,
          fee: park.fee,
          meta: park.fee,
          sub: `${park.near} · 명소까지 도보 ${park.walk}`,
        }))}
      />

      <ul className="mt-2 flex gap-3">
        <li className="text-muted flex items-center gap-1.5 text-[10.5px]">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: "#2e7d4f" }}
          />
          무료
        </li>
        <li className="text-muted flex items-center gap-1.5 text-[10.5px]">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full"
            style={{ background: "#d1782c" }}
          />
          유료
        </li>
      </ul>

      <ul className="mt-5">
        {zone.parks.map((park) => (
          <li
            key={park.name}
            className="border-line grid gap-x-4 gap-y-1 border-t py-4 sm:grid-cols-[minmax(0,1.3fr)_92px_150px_minmax(0,1fr)] sm:items-center"
          >
            <div>
              <span className="text-ink text-[13.5px] font-bold">
                {park.name}
              </span>
              <span className="text-muted mt-0.5 block text-[11.5px]">
                {park.near}
              </span>
            </div>
            <span
              className={
                park.fee === "무료"
                  ? "w-fit rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white"
                  : "w-fit rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white"
              }
              style={{
                background: park.fee === "무료" ? "#2e7d4f" : "#d1782c",
              }}
            >
              {park.fee}
            </span>
            <span
              className={
                isCrowded(park.risk)
                  ? "text-[11.5px] font-bold text-[oklch(55%_0.19_25)]"
                  : "text-muted text-[11.5px]"
              }
            >
              {park.risk}
            </span>
            <span className="text-muted text-[11.5px]">
              도보 {park.walk} · 대안 {park.alt}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
