import type { SpotDetail } from "@/entities/spot";

export function SpotMenu({ menu }: { menu: SpotDetail["menu"] }) {
  if (menu.length === 0) return null;

  return (
    <section>
      <h2 className="text-ink text-[13.5px] font-bold">메뉴</h2>
      <ul className="mt-3 space-y-2">
        {menu.map((item) => (
          <li
            key={item.name}
            className="border-line flex items-baseline justify-between gap-4 border-b pb-2"
          >
            <span className="text-ink text-[12.5px]">{item.name}</span>
            <span className="text-muted text-[12.5px] tabular-nums">
              {item.price}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
