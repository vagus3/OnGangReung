import Link from "next/link";

const STEPS = [
  ["09:30", "경포호 산책", "물가를 따라 천천히 시작"],
  ["12:10", "초당 한 끼", "대기 시간을 피해 점심"],
  ["16:40", "안목의 노을", "커피와 함께 보는 바다"],
];

export function HomeAiTeaser() {
  return (
    <section className="ai-teaser relative isolate min-h-[86svh] overflow-hidden bg-[oklch(18%_0.04_250)] text-white">
      <div className="ai-orb ai-orb-one" aria-hidden="true" />
      <div className="ai-orb ai-orb-two" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid min-h-[86svh] max-w-[1360px] items-center gap-12 px-4 py-20 sm:px-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-[560px]">
          <p className="text-[10.5px] font-bold tracking-[0.26em] text-white/55">
            AI COURSE MAKER
          </p>
          <h2 className="font-display mt-5 text-[clamp(34px,5vw,58px)] leading-[1.12] tracking-[-0.025em]">
            하고 싶은 말을 적으면
            <br />
            강릉의 하루가 됩니다
          </h2>
          <p className="mt-5 max-w-[45ch] text-[14px] leading-[1.85] text-white/65">
            동행과 시간, 좋아하는 분위기만 알려주세요. 이동 거리와 운영 시간을
            함께 보고 하루의 순서를 제안합니다.
          </p>
          <Link
            href="/ai"
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-[13px] font-bold text-slate-900 transition hover:-translate-y-1 hover:shadow-xl"
          >
            내 코스 만들기 <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="absolute -inset-10 rounded-full bg-[oklch(65%_0.12_225/0.14)] blur-3xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/8 p-5 shadow-[0_40px_100px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex items-center justify-between border-b border-white/12 pb-5">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-white/45">
                  YOUR DAY
                </p>
                <p className="font-display mt-1 text-[22px]">
                  바다를 따라 걷는 하루
                </p>
              </div>
              <span className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] text-white/65">
                1일
              </span>
            </div>
            <ol className="space-y-3">
              {STEPS.map(([time, title, body], index) => (
                <li
                  key={time}
                  className="group grid grid-cols-[56px_1fr] gap-4 rounded-[18px] border border-white/10 bg-black/10 p-4 transition hover:border-white/25 hover:bg-white/10"
                >
                  <div className="text-[11px] text-white/45">{time}</div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-900">
                        {index + 1}
                      </span>
                      <strong className="font-display text-[17px] font-normal">
                        {title}
                      </strong>
                    </div>
                    <p className="mt-2 text-[11.5px] text-white/50">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
