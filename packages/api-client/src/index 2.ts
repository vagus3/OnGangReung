import createClient from "openapi-fetch";

import type { paths } from "./types";

export type { components, paths } from "./types";

/**
 * 타입 안전 API 클라이언트 팩토리.
 * 경로/요청/응답 타입은 FastAPI OpenAPI 스키마에서 자동 생성된다 (src/types.ts).
 */
export function createApiClient(baseUrl: string) {
  return createClient<paths>({ baseUrl });
}
