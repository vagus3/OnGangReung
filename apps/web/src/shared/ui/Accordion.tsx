"use client";

import { useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  meta?: string;
  body: ReactNode;
};

/** 공지·약관·안내센터가 공유하는 아코디언. 한 번에 하나만 펼친다. */
export function Accordion({
  items,
  defaultOpenId,
  label,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  label: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <ul className="border-line border-t" aria-label={label}>
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <li key={item.id} className="border-line border-b">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-baseline justify-between gap-4 py-4 text-left"
            >
              <span className="min-w-0">
                {item.meta !== undefined && (
                  <span className="text-muted block text-[10.5px]">
                    {item.meta}
                  </span>
                )}
                <span className="text-ink mt-0.5 block text-[13.5px] font-bold">
                  {item.title}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={
                  open
                    ? "text-muted shrink-0 rotate-180 text-[11px] transition-transform"
                    : "text-muted shrink-0 text-[11px] transition-transform"
                }
              >
                ▾
              </span>
            </button>
            {open && <div className="pb-5">{item.body}</div>}
          </li>
        );
      })}
    </ul>
  );
}
