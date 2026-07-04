import path from "node:path";

import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

// 모노레포 루트 .env를 로드한다 — Next.js는 기본적으로 앱 디렉터리의 .env만 읽는다.
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const nextConfig: NextConfig = {
  // Docker 배포용 최소 번들 (apps/web/Dockerfile에서 사용)
  output: "standalone",
};

export default nextConfig;
