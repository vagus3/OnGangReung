import { ACCESS_ROUTES } from "@/entities/content";
import { Card } from "@/shared/ui";

/**
 * 무장애 경로 (열린관광지).
 *
 * v3가 지운 화면이지만 이 앱이 다루는 주제 중 하나라 되살린다
 * (DESIGN.md 8절 — 접근성이 기능이면서 주제다).
 */
export function GuideAccess() {
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {ACCESS_ROUTES.map((route) => (
        <li key={route.id}>
          <Card as="article">
            <h3 className="font-display text-ink text-[17px]">{route.name}</h3>
            <p className="text-muted mt-2 text-[12px] leading-relaxed">
              {route.desc}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1">
              {route.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-line text-muted rounded-full border px-2 py-0.5 text-[10.5px]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </Card>
        </li>
      ))}
    </ul>
  );
}
