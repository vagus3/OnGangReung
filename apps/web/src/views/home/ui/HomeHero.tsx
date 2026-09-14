import { Chip } from "@/shared/ui";

// 인기 검색어는 아직 집계 기반이 없어 고정값이다. 검색 기능이 붙으면
// 실제 집계로 바꾼다.
const POPULAR = [
  "정동진 일출",
  "안목 로스터리",
  "초당순두부",
  "안반데기 별",
  "월화거리 야경",
];

export function HomeHero() {
  return (
    <section className="border-line border-b px-4 py-16 sm:px-12 sm:py-24">
      <p className="text-muted text-[10.5px] font-bold tracking-[0.2em]">
        #2026_2027_강릉방문의해
      </p>
      <h1 className="font-display text-ink mt-4 max-w-[16ch] text-[32px] leading-tight sm:text-[44px]">
        바다와 커피, 그리고 아직 안 가본 골목
      </h1>
      <p className="text-muted mt-4 max-w-[44ch] text-[13.5px] leading-relaxed">
        강릉의 다섯 권역을 하루 단위로 끊어 담았습니다. 어디서 시작할지만 고르면
        됩니다.
      </p>

      <ul className="mt-8 flex flex-wrap gap-2">
        {POPULAR.map((keyword) => (
          <li key={keyword}>
            <Chip>{keyword}</Chip>
          </li>
        ))}
      </ul>
    </section>
  );
}
