import { ACCESS_INFO, EMERGENCY } from "@/entities/content";
import { Card } from "@/shared/ui";

export function MyHelp() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-ink text-[13.5px] font-bold">긴급 연락</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {EMERGENCY.map((item) => (
            <li key={item.number}>
              <a
                href={`tel:${item.number}`}
                className="border-line hover:border-sea/40 block rounded-[16px] border p-4 text-center transition-colors"
              >
                <span className="text-muted block text-[11px]">
                  {item.label}
                </span>
                <span className="font-display text-ink mt-1 block text-[22px]">
                  {item.number}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-ink text-[13.5px] font-bold">
          도움받을 수 있는 곳
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {ACCESS_INFO.map((info) => (
            <li key={info.key}>
              <Card as="article">
                <h4 className="text-ink text-[12.5px] font-bold">
                  {info.title}
                </h4>
                <p className="text-muted mt-2 text-[11.5px] leading-relaxed">
                  {info.desc}
                </p>
                <a
                  href={`https://${info.link}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sea mt-3 inline-block text-[11.5px]"
                >
                  {info.linkLabel} ↗
                </a>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
