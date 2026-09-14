import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api";

// apiClient를 모킹한다. MSW는 아직 도입하지 않았고, 기존 테스트도 네트워크를
// 띄우지 않는 방식을 쓴다 (PostCreateForm). 여기서 검증할 것은 호출 파라미터
// 모양과 에러 변환이지 HTTP 자체가 아니다.
// vi.mock은 파일 최상단으로 끌어올려지므로 vi.hoisted로 함께 올린다.
const { GET } = vi.hoisted(() => ({ GET: vi.fn() }));

vi.mock("@/shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api")>();
  return { ...actual, apiClient: { GET } };
});

const { spotApi } = await import("./spot.api");

describe("spotApi.list", () => {
  beforeEach(() => {
    GET.mockReset();
  });

  it("쿼리를 그대로 전달한다", async () => {
    GET.mockResolvedValue({ data: [], error: undefined });

    await spotApi.list({ rail: "beach", limit: 10 });

    expect(GET).toHaveBeenCalledWith("/api/v1/spots", {
      params: { query: { rail: "beach", limit: 10 } },
    });
  });

  it("인자가 없으면 빈 쿼리로 부른다", async () => {
    GET.mockResolvedValue({ data: [], error: undefined });

    await spotApi.list();

    expect(GET).toHaveBeenCalledWith("/api/v1/spots", {
      params: { query: {} },
    });
  });

  it("응답 데이터를 그대로 돌려준다", async () => {
    const spots = [{ slug: "spot_gyeongpo" }];
    GET.mockResolvedValue({ data: spots, error: undefined });

    await expect(spotApi.list()).resolves.toBe(spots);
  });

  it("에러는 백엔드 detail을 살려 ApiError로 던진다", async () => {
    GET.mockResolvedValue({
      data: undefined,
      error: { detail: "잘못된 권역입니다", code: "bad_zone" },
    });

    await expect(spotApi.list()).rejects.toThrow(ApiError);
    await expect(spotApi.list()).rejects.toThrow("잘못된 권역입니다");
  });

  it("detail이 없으면 기본 메시지를 쓴다", async () => {
    GET.mockResolvedValue({ data: undefined, error: {} });

    await expect(spotApi.list()).rejects.toThrow(
      "관광지 목록을 불러오지 못했습니다",
    );
  });
});

describe("spotApi.detail", () => {
  beforeEach(() => {
    GET.mockReset();
  });

  it("slug를 경로 파라미터로 넘긴다", async () => {
    GET.mockResolvedValue({ data: { slug: "spot_anmok" }, error: undefined });

    await spotApi.detail("spot_anmok");

    expect(GET).toHaveBeenCalledWith("/api/v1/spots/{slug}", {
      params: { path: { slug: "spot_anmok" } },
    });
  });

  it("404는 code를 보존한다", async () => {
    GET.mockResolvedValue({
      data: undefined,
      error: { detail: "Spot 'x' not found", code: "spot_not_found" },
    });

    await expect(spotApi.detail("x")).rejects.toMatchObject({
      code: "spot_not_found",
    });
  });
});
