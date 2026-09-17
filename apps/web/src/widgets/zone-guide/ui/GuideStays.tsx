import { Card } from "@/shared/ui";
import type { GuideZoneContent } from "@/entities/guide";

export function GuideStays({ zone }: { zone: GuideZoneContent }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {zone.stays.map((stay) => (
        <li key={stay.name}>
          <Card as="article">
            <h3 className="font-display text-ink text-[17px]">{stay.name}</h3>
            <dl className="border-line divide-line mt-3 divide-y border-t">
              {stay.rows.map((row) => (
                <div key={row.label} className="flex justify-between py-2">
                  <dt className="text-muted text-[11.5px]">{row.label}</dt>
                  <dd className="text-ink m-0 text-[12.5px]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </li>
      ))}
    </ul>
  );
}
