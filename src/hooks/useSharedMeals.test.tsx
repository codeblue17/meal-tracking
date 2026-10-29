import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSharedMeals } from "@/hooks/useSharedMeals";
import type { SharedMeals } from "@/types/mealShare";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: { rpc: rpcMock },
}));

const SHARED: SharedMeals = {
  status: "ok",
  owner_name: "テスト太郎",
  goal_type: "weight_loss",
  goal_detail: "3kg減",
  label: "山田先生",
  start_date: "2026-10-01",
  end_date: null,
  expires_at: "2026-11-01T00:00:00Z",
  include_memo: false,
  include_images: false,
  meals: [
    {
      id: "meal-1",
      name: "焼き魚定食",
      meal_time: "dinner",
      eaten_at: "2026-10-05",
      memo: null,
      image_path: null,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSharedMeals", () => {
  it("トークンで get_shared_meals を呼び、結果を返す", async () => {
    rpcMock.mockResolvedValue({ data: SHARED, error: null });

    const { result } = renderHook(() => useSharedMeals("token-1"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(rpcMock).toHaveBeenCalledWith("get_shared_meals", {
      p_token: "token-1",
    });
    expect(result.current.result).toEqual(SHARED);
    expect(result.current.error).toBe(false);
  });

  it("期限切れ・存在しないリンクは status だけを返す", async () => {
    rpcMock.mockResolvedValue({ data: { status: "expired" }, error: null });

    const { result } = renderHook(() => useSharedMeals("token-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.result).toEqual({ status: "expired" });
  });

  it("取得に失敗したら error を true にする", async () => {
    rpcMock.mockResolvedValue({ data: null, error: new Error("network") });

    const { result } = renderHook(() => useSharedMeals("token-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.result).toBeNull();
  });

  it("トークンが無ければ RPC を呼ばず not_found を返す", () => {
    const { result } = renderHook(() => useSharedMeals(undefined));

    expect(rpcMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual({ status: "not_found" });
  });
});
