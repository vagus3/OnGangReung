import { NOTICES } from "@/entities/content";
import { Accordion } from "@/shared/ui";

export function MyNotices() {
  return (
    <Accordion
      label="공지사항"
      defaultOpenId={NOTICES[0]?.id}
      items={NOTICES.map((notice) => ({
        id: notice.id,
        meta: `${notice.date} · ${notice.category}`,
        title: notice.title,
        body: (
          <p className="text-muted text-[12.5px] leading-relaxed">
            {notice.body}
          </p>
        ),
      }))}
    />
  );
}
