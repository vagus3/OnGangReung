import Link from "next/link";

import { POLICIES } from "@/entities/content";
import { WEATHER_DISCLAIMER } from "@/entities/guide";

// 디자인 캔버스는 각 링크를 #terms/#privacy/#lbs/#ai-notice 앵커로 걸어
// 같은 페이지 안에서 스크롤시켰다. 이 앱은 약관 전문을 /my의 아코디언
// (MyPolicies) 하나로 모아뒀으므로 네 링크 모두 그곳으로 보낸다 —
// 존재하지 않는 앵커로 죽은 링크를 만들지 않기 위한 실용적 단순화다.
const LEGAL_LINKS = POLICIES.map((policy) => ({
  id: policy.id,
  label: policy.title,
}));

/**
 * 데스크톱 전용 하단 푸터. 디자인 캔버스에 있었으나 구현에서 빠져 있던
 * 조각 — 브랜드 소개, 약관 링크, AI·날씨 면책 문구, 문의처를 담는다.
 */
export function SiteFooter() {
  return (
    <footer className="border-line bg-ink text-paper mt-16 hidden border-t px-4 pt-14 pb-10 sm:px-12 md:block">
      <div className="mx-auto max-w-[1360px]">
        <div className="border-paper/15 flex flex-wrap items-start justify-between gap-9 border-b pb-8">
          <div className="max-w-[390px]">
            <p className="font-display text-[26px]">온강릉</p>
            <p className="mt-3 text-[12.5px] leading-[1.8] text-balance opacity-60">
              강릉을 시작으로 속초 · 동해까지, 같은 구조에 도시 데이터만 갈아
              끼우는 멀티 리전 관광 플랫폼입니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.id}
                href="/my"
                className="text-[12.5px] opacity-75 hover:opacity-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6 pt-6">
          <p className="max-w-[640px] text-[12px] leading-[1.85] text-balance opacity-60">
            AI 추천 일정은 실제 영업시간 및 현장 상황과 다를 수 있습니다. 방문
            전 각 시설의 운영 정보를 반드시 확인해 주세요. {WEATHER_DISCLAIMER}
          </p>
          <p className="text-right text-[11.5px] leading-[1.9] opacity-50">
            강릉시 관광정책과 · 관광통역안내 1330
            <br />© {new Date().getFullYear()} ON GANGNEUNG
          </p>
        </div>
      </div>
    </footer>
  );
}
