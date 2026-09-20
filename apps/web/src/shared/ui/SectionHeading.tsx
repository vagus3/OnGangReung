type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  level?: 2 | 3;
  inverse?: boolean;
};

// 섹션 제목은 세리프(Song Myung). eyebrow는 그 위의 작은 라벨.
export function SectionHeading({
  eyebrow,
  title,
  level = 2,
  inverse = false,
}: SectionHeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <div className="px-4 sm:px-12">
      {eyebrow !== undefined && (
        <p
          className={`${inverse ? "text-white/55" : "text-muted"} text-[10.5px] font-bold tracking-[0.14em] uppercase`}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        className={`font-display mt-2 text-[clamp(25px,4vw,42px)] leading-snug ${inverse ? "text-white" : "text-ink"}`}
      >
        {title}
      </Tag>
    </div>
  );
}
