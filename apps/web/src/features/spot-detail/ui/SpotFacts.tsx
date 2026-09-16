import type { SpotDetail } from "@/entities/spot";

type Row = { label: string; value: string };

// 있는 것만 줄로 만든다. 디자인은 빈 항목을 아예 그리지 않는다.
function rowsOf(spot: SpotDetail): Row[] {
  const rows: Row[] = [];
  if (spot.address !== null) rows.push({ label: "주소", value: spot.address });
  if (spot.hours !== null) rows.push({ label: "운영", value: spot.hours });
  if (spot.tel !== null) rows.push({ label: "전화", value: spot.tel });
  if (spot.parking !== null) rows.push({ label: "주차", value: spot.parking });
  return rows;
}

export function SpotFacts({ spot }: { spot: SpotDetail }) {
  const rows = rowsOf(spot);
  if (rows.length === 0) return null;

  return (
    <dl className="border-line divide-line divide-y border-y">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-4 py-3">
          <dt className="text-muted w-14 shrink-0 text-[11.5px] font-bold">
            {row.label}
          </dt>
          <dd className="text-ink m-0 text-[12.5px] leading-relaxed">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
