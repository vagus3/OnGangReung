type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  level?: 2 | 3;
};

// 섹션 제목은 세리프(Song Myung). eyebrow는 그 위의 작은 라벨.
export function SectionHeading({
  eyebrow,
  title,
  level = 2,
}: SectionHeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <div className="px-4 sm:px-12">
      {eyebrow !== undefined && (
        <p className="text-muted text-[10.5px] font-bold tracking-[0.14em] uppercase">
          {eyebrow}
        </p>
      )}
      <Tag className="font-display text-ink mt-2 text-[22px] leading-snug">
        {title}
      </Tag>
    </div>
  );
}
