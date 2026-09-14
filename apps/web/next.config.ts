import path from "node:path";

import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

// 모노레포 루트 .env를 로드한다 — Next.js는 기본적으로 앱 디렉터리의 .env만 읽는다.
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const nextConfig: NextConfig = {
  // Docker 배포용 최소 번들 (apps/web/Dockerfile에서 사용)
  output: "standalone",
  images: {
    // TourAPI 대표 사진은 한국관광공사 이미지 서버에서 온다.
    // next/image가 외부 호스트를 쓰려면 여기 명시해야 한다 (REVIEW.md).
    remotePatterns: [
      { protocol: "http", hostname: "tong.visitkorea.or.kr" },
      { protocol: "https", hostname: "tong.visitkorea.or.kr" },
    ],
  },
};

export default nextConfig;
