import type { ReactNode } from "react";

type Tone = "paper" | "sand";

type HomeSectionProps = {
  /** 캔버스는 sand와 기본 지면을 번갈아 깔아 섹션 경계를 만든다. */
  tone?: Tone;
  children: ReactNode;
};

// 캔버스의 homeSecH = calc(100dvh - navH). 우리 헤더는 4rem(64px)이다.
const SECTION_HEIGHT = "min-h-[calc(100dvh-4rem)]";

const TONE: Record<Tone, string> = {
  paper: "bg-paper",
  sand: "bg-sand",
};

/**
 * 홈의 한 칸. 캔버스는 홈을 화면 높이만 한 패널 일곱 장으로 끊고
 * 배경을 sand ↔ 지면으로 번갈아 깔아 섹션을 구분한다. 내용은 세로
 * 가운데에 놓인다.
 *
 * 배경 줄무늬가 화면 끝까지 닿아야 하므로 폭 제한은 바깥이 아니라
 * 이 안쪽 컨테이너가 맡는다.
 */
export function HomeSection({ tone = "paper", children }: HomeSectionProps) {
  return (
    <section
      className={`${TONE[tone]} ${SECTION_HEIGHT} flex flex-col justify-center py-[clamp(24px,5dvh,80px)]`}
    >
      {/* 가로 여백은 SectionHeading 등 내부 컴포넌트가 이미 들고 있다.
          여기서 더하면 이중이 되므로 폭만 잡는다. */}
      <div className="mx-auto w-full max-w-[1360px]">{children}</div>
    </section>
  );
}
