import { IBM_Plex_Sans_KR, Song_Myung } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

// 디스플레이(세리프)와 본문을 분리한다. globals.css의 @theme이 이 variable을
// 참조하므로 이름을 맞춰야 한다.
// 두 폰트의 옵션이 다르다. Song Myung은 서브셋이 하나뿐이라 next/font가
// subsets를 아예 노출하지 않고(지정하면 타입 에러), IBM Plex Sans KR은
// latin/latin-ext가 있어 preload를 켜려면 subsets가 필수다.
const songMyung = Song_Myung({
  weight: "400",
  variable: "--font-song-myung",
  display: "swap",
});

const plexSansKr = IBM_Plex_Sans_KR({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "온강릉",
  description: "강릉 관광 안내 — 관광지, 권역별 여행 정보, AI 코스 추천",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${songMyung.variable} ${plexSansKr.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
