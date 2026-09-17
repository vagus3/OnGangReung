import { POLICIES } from "@/entities/content";
import { Accordion } from "@/shared/ui";

export function MyPolicies() {
  return (
    <Accordion
      label="약관 및 정책"
      defaultOpenId={POLICIES[0]?.id}
      items={POLICIES.map((policy) => ({
        id: policy.id,
        meta: policy.updated,
        title: policy.title,
        body: (
          <ul className="space-y-2">
            {policy.lines.map((line) => (
              <li
                key={line}
                className="text-muted text-[12.5px] leading-relaxed"
              >
                {line}
              </li>
            ))}
          </ul>
        ),
      }))}
    />
  );
}
