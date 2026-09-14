// 네비게이션 탭 5개 중 아직 구현되지 않은 자리. 링크를 먼저 지우는 대신
// 자리를 두는 이유는 탭 구성이 디자인의 정보구조이기 때문이다.
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex max-w-[1360px] flex-col items-start px-4 py-24 pb-24 sm:px-12 md:pb-12">
      <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
        준비 중
      </p>
      <h1 className="font-display text-ink mt-3 text-[32px]">{title}</h1>
      <p className="text-muted mt-4 max-w-[44ch] text-[13.5px] leading-relaxed">
        {description}
      </p>
    </main>
  );
}
