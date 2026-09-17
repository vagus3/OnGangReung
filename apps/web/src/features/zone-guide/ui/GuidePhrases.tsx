"use client";

import { useState } from "react";

import { PHRASES } from "@/entities/content";

/**
 * 다국어 회화.
 *
 * v3가 지운 화면이다. 이 앱에서 영어가 실제로 필요한 유일한 기능이라 되살린다 —
 * i18n 전체를 하지 않더라도 이건 값이 있다.
 *
 * 재생은 브라우저 speechSynthesis를 쓴다. 서버가 필요 없고 오프라인에서도 된다.
 */
export function GuidePhrases() {
  const [playing, setPlaying] = useState<string | null>(null);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  function speak(id: string, text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);
    setPlaying(id);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div>
      <ul className="border-line border-t">
        {PHRASES.map((phrase) => (
          <li
            key={phrase.id}
            className="border-line flex items-center justify-between gap-4 border-b py-4"
          >
            <span className="min-w-0">
              <span className="text-ink block text-[13px]">{phrase.ko}</span>
              <span className="text-muted mt-1 block text-[12px] italic">
                {phrase.en}
              </span>
            </span>
            {supported && (
              <button
                type="button"
                onClick={() => speak(phrase.id, phrase.en)}
                aria-label={`${phrase.ko} 영어로 듣기`}
                className="border-line text-muted hover:text-ink shrink-0 rounded-full border px-3 py-1.5 text-[11px]"
              >
                {playing === phrase.id ? "재생 중" : "▶ 듣기"}
              </button>
            )}
          </li>
        ))}
      </ul>
      {!supported && (
        <p className="text-muted mt-3 text-[11.5px]">
          이 브라우저는 음성 재생을 지원하지 않습니다.
        </p>
      )}
    </div>
  );
}
