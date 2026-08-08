// FastAPI 표준 에러 응답: { detail: string | ValidationErrorItem[] }
// 커스텀 도메인 예외(app/core/exceptions.py)는 { detail, code }를 추가로 내려준다.
type FastApiErrorBody = {
  detail?: string | Array<{ msg?: string }>;
  code?: string;
};

export class ApiError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  const body = error as FastApiErrorBody | undefined;
  const detail = body?.detail;

  if (typeof detail === "string") return new ApiError(detail, body?.code);
  if (Array.isArray(detail)) {
    const message = detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ");
    if (message) return new ApiError(message, body?.code);
  }

  return new ApiError(fallbackMessage, body?.code);
}
