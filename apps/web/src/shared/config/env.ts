import { z } from "zod";

// 환경변수는 반드시 이 모듈을 통해 접근한다 (컴포넌트에서 process.env 직접 접근 금지).
// NEXT_PUBLIC_ 변수는 빌드 시점에 정적으로 치환되므로 명시적으로 나열해야 한다.
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("SHG Template"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});
