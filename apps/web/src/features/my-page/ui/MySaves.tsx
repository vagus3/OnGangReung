"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useSpots } from "@/entities/spot";
import { GeoMap } from "@/shared/ui";

import { useSavesStore } from "@/features/my-saves";

import { checkStamp, formatDistance } from "../model/distance";

type Position = { lat: number; lng: number } | null;

export function MySaves() {
  const hydrate = useSavesStore((s) => s.hydrate);
  const saved = useSavesStore((s) => s.saved);
  const visited = useSavesStore((s) => s.visited);
  const notes = useSavesStore((s) => s.notes);
  const setNote = useSavesStore((s) => s.setNote);
  const markVisited = useSavesStore((s) => s.markVisited);
  const toggleSave = useSavesStore((s) => s.toggleSave);

  const { data: spots = [] } = useSpots({ limit: 100 });
  const [here, setHere] = useState<Position>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 저장값 반영은 마운트 이후로 미룬다 — 서버 렌더링과 어긋나면 안 된다
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const savedSpots = spots.filter((spot) => saved.has(spot.slug));

  function locate() {
    if (
      typeof navigator === "undefined" ||
      navigator.geolocation === undefined
    ) {
      setLocationError("이 브라우저는 위치를 알려주지 않습니다.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        // 권한 거부와 실패를 구분해 알릴 방법이 마땅치 않아 한 문구로 둔다
        setLocationError("위치를 확인하지 못했습니다. 권한을 확인해 주세요.");
        setLocating(false);
      },
      { timeout: 10_000 },
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-ink text-[13.5px] font-bold">
            방문 스탬프 · {visited.size}/{spots.length}
          </h3>
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="border-line text-muted hover:text-ink rounded-full border px-3 py-1.5 text-[11.5px]"
          >
            {locating ? "위치 확인 중…" : "현재 위치로 확인"}
          </button>
        </div>

        {locationError !== null && (
          <p
            role="alert"
            className="mt-2 text-[11.5px] text-[oklch(55%_0.19_25)]"
          >
            {locationError}
          </p>
        )}
        <p className="text-muted mt-2 text-[11.5px]">
          장소에서 500m 안에 있으면 스탬프를 찍을 수 있습니다.
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => {
            const done = visited.has(spot.slug);
            const near = checkStamp(here, spot);
            return (
              <li
                key={spot.slug}
                className="border-line flex items-center justify-between gap-3 rounded-[16px] border p-3"
              >
                <span className="min-w-0">
                  <span className="text-ink block truncate text-[12.5px] font-bold">
                    {spot.name}
                  </span>
                  <span className="text-muted block text-[10.5px]">
                    {done
                      ? "방문함"
                      : near.status === "no-location"
                        ? "위치 확인 필요"
                        : near.status === "ok"
                          ? `${formatDistance(near.distance)} — 찍을 수 있어요`
                          : `${formatDistance(near.distance)} 떨어짐`}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={done || near.status !== "ok"}
                  onClick={() => markVisited(spot.slug)}
                  className={
                    done
                      ? "bg-sea text-paper shrink-0 rounded-full px-3 py-1 text-[10.5px] font-bold"
                      : "border-line text-muted shrink-0 rounded-full border px-3 py-1 text-[10.5px] disabled:opacity-40"
                  }
                >
                  {done ? "완료" : "찍기"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="text-ink text-[13.5px] font-bold">
          저장한 장소 · {savedSpots.length}
        </h3>

        {savedSpots.length === 0 ? (
          <p className="text-muted mt-3 text-[12.5px]">
            아직 저장한 장소가 없습니다. 장소 상세에서 저장할 수 있습니다.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <GeoMap
                label="저장한 장소"
                mode="order"
                height={320}
                points={savedSpots
                  .filter((s) => s.lat !== null && s.lng !== null)
                  .map((s, i) => ({
                    name: s.name,
                    lat: s.lat as number,
                    lng: s.lng as number,
                    meta: String(i + 1),
                  }))}
              />
            </div>

            <ul className="mt-5 space-y-3">
              {savedSpots.map((spot) => (
                <li
                  key={spot.slug}
                  className="border-line rounded-[16px] border p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/spots/${spot.slug}`}
                      className="font-display text-ink text-[15px]"
                    >
                      {spot.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSave(spot.slug)}
                      className="text-muted hover:text-ink text-[11px] underline"
                    >
                      저장 해제
                    </button>
                  </div>
                  <label
                    htmlFor={`note-${spot.slug}`}
                    className="text-muted mt-3 block text-[10.5px]"
                  >
                    메모
                  </label>
                  <textarea
                    id={`note-${spot.slug}`}
                    defaultValue={notes[spot.slug] ?? ""}
                    onBlur={(e) => setNote(spot.slug, e.target.value)}
                    rows={2}
                    placeholder="시킬 메뉴, 갈 시간대, 현금만 받는지 — 내가 아는 것"
                    className="border-line bg-paper text-ink focus:border-sea mt-1 w-full rounded-[12px] border px-3 py-2 text-[12px] outline-none"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
