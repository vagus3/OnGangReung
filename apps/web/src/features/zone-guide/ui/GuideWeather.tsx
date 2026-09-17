import { WEATHER, WEATHER_DISCLAIMER } from "@/entities/guide";

export function GuideWeather() {
  return (
    <div>
      <p className="text-muted text-[11.5px]">
        {WEATHER.updated} · {WEATHER.source}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="font-display text-ink text-[36px] leading-none">
            {WEATHER.temp}°
          </p>
          <p className="text-muted mt-1 text-[12.5px]">
            체감 {WEATHER.feels}° · {WEATHER.sky}
          </p>

          <ul className="mt-4 grid grid-cols-3 gap-2">
            {WEATHER.now.map((stat) => (
              <li key={stat.label} className="bg-sand rounded-[16px] p-3">
                <span className="text-muted block text-[10.5px]">
                  {stat.label}
                </span>
                <span className="text-ink mt-1 block text-[14px] font-bold">
                  {stat.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="border-line divide-line divide-y border-t">
          {WEATHER.sea.map((row) => (
            <div key={row.label} className="flex justify-between py-2.5">
              <dt className="text-muted text-[11.5px]">{row.label}</dt>
              <dd className="text-ink m-0 text-[12.5px]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul
        className="scrollbar-none mt-6 flex gap-2 overflow-x-auto"
        aria-label="시간별 예보"
      >
        {WEATHER.hourly.map((hour, index) => (
          <li
            key={hour.time}
            className={
              index === 0
                ? "bg-ink text-paper min-w-[92px] shrink-0 rounded-[16px] px-4 py-4 text-center"
                : "bg-sand text-ink min-w-[92px] shrink-0 rounded-[16px] px-4 py-4 text-center"
            }
          >
            <span className="block text-[10.5px] opacity-80">{hour.time}</span>
            <span className="mt-2 block text-[15px] font-bold">
              {hour.temp}°
            </span>
            <span className="mt-1 block text-[10px] opacity-70">
              {hour.sky}
            </span>
          </li>
        ))}
      </ul>

      <ul className="mt-6" aria-label="일별 예보">
        {WEATHER.daily.map((day) => (
          <li
            key={day.day}
            className="border-line grid grid-cols-[72px_1fr_84px] items-center gap-3 border-t py-3 sm:grid-cols-[110px_1fr_120px]"
          >
            <span className="text-ink text-[12.5px] font-bold">{day.day}</span>
            <span className="text-muted text-[11.5px]">
              {day.sky} · 강수 {day.rain}%
            </span>
            <span className="text-ink text-right text-[12.5px] tabular-nums">
              <span className="text-muted">{day.min}°</span> / {day.max}°
            </span>
          </li>
        ))}
      </ul>

      <p className="text-muted mt-5 text-[11.5px] leading-relaxed">
        {WEATHER_DISCLAIMER}
      </p>
    </div>
  );
}
