import { createApiClient } from "@shg/api-client";

import { env } from "@/shared/config/env";

// 경로/요청/응답 타입은 FastAPI OpenAPI 스키마에서 자동 생성 (@shg/api-client)
export const apiClient = createApiClient(env.NEXT_PUBLIC_API_URL);
