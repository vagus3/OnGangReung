import {
  isPick,
  TRANSPORT_HEADERS,
  transportRows,
  type GuideZoneContent,
} from "@/entities/guide";

export function GuideTransport({ zone }: { zone: GuideZoneContent }) {
  const rows = transportRows(zone.pick);

  return (
    <div>
      <p className="text-muted max-w-[60ch] text-[12.5px] leading-relaxed">
        {zone.transport}
      </p>

      <div className="border-line mt-5 overflow-x-auto rounded-[16px] border">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-line border-b">
              <th className="text-muted px-4 py-3 text-left text-[10.5px] font-bold">
                수단
              </th>
              {TRANSPORT_HEADERS.map((header) => (
                <th
                  key={header}
                  className="text-muted px-4 py-3 text-left text-[10.5px] font-bold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const picked = isPick(row.mode, zone.pick);
              return (
                <tr
                  key={row.mode}
                  className={
                    picked
                      ? "border-line bg-[var(--color-tint)] border-t"
                      : "border-line border-t"
                  }
                >
                  <td className="px-4 py-4">
                    <span className="text-ink text-[12.5px] font-bold">
                      {row.mode}
                    </span>
                    {/* 추천을 배경색으로만 알리지 않는다 */}
                    {picked && (
                      <span className="bg-sea text-paper ml-2 rounded-full px-2 py-0.5 text-[9.5px] font-bold">
                        추천
                      </span>
                    )}
                  </td>
                  <td className="text-ink px-4 py-4 text-[12px]">{row.cost}</td>
                  <td className="text-ink px-4 py-4 text-[12px]">{row.time}</td>
                  <td className="text-muted px-4 py-4 text-[12px]">
                    {row.drive}
                  </td>
                  <td className="text-muted px-4 py-4 text-[12px]">
                    {row.booking}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-muted mt-4 text-[11.5px] leading-relaxed">
        {zone.note}
      </p>
    </div>
  );
}
