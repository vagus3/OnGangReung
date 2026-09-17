import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { userKeys } from "@/entities/user";
import { useLogout } from "./useAuthActions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/entities/user", async (original) => ({
  ...(await original<typeof import("@/entities/user")>()),
  userApi: { logout: vi.fn().mockResolvedValue(undefined) },
}));

it("discards the previous account's cached courses on logout", async () => {
  const client = new QueryClient();
  client.setQueryData(
    ["ai-courses", "history", 1],
    [{ id: 99, title: "private" }],
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useLogout(), { wrapper });
  await act(() => result.current.mutateAsync());
  expect(client.getQueryData(["ai-courses", "history", 1])).toBeUndefined();
  expect(client.getQueryData(userKeys.me)).toBeNull();
});
