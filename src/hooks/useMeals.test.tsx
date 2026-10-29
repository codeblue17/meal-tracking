import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import { useMeals } from "@/hooks/useMeals";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";
import type { Meal } from "@/types/meal";

// supabase.from("meals").select().eq().order().order() のチェーンを再現する
const { fromMock, eqMock, queryResultMock } = vi.hoisted(() => {
  const queryResultMock = vi.fn();
  const eqMock = vi.fn();
  const chain = {
    select: vi.fn(() => chain),
    eq: eqMock.mockImplementation(() => chain),
    order: vi.fn(() => chain),
    // 2回目の order の後に await されるので thenable にしておく
    then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(queryResultMock()).then(resolve, reject),
  };
  const fromMock = vi.fn(() => chain);
  return { fromMock, eqMock, queryResultMock };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

const makeMeal = (id: string): Meal => ({
  id,
  user_id: "user-1",
  name: `食事${id}`,
  meal_time: "lunch",
  eaten_at: "2026-06-11",
  memo: null,
  image_path: null,
  created_at: "2026-06-11T12:00:00Z",
});

const renderUseMeals = (user: Partial<User> | null = { id: "user-1" }) => {
  const authValue: AuthContextType = {
    user: user as User | null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
  return renderHook(() => useMeals(), { wrapper });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useMeals", () => {
  it("マウント時にログインユーザーの食事を取得する", async () => {
    const meals = [makeMeal("1"), makeMeal("2")];
    queryResultMock.mockReturnValue({ data: meals, error: null });

    const { result } = renderUseMeals();

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.meals).toEqual(meals);
    expect(fromMock).toHaveBeenCalledWith("meals");
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(toasterCreateMock).not.toHaveBeenCalled();
  });

  it("取得に失敗したらエラートーストを出し、loading を解除する", async () => {
    queryResultMock.mockReturnValue({ data: null, error: new Error("boom") });

    const { result } = renderUseMeals();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.meals).toEqual([]);
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "食事の取得に失敗しました",
      type: "error",
    });
  });

  it("未ログインなら取得せず、最初から loading は false", async () => {
    const { result } = renderUseMeals(null);

    expect(result.current.loading).toBe(false);
    await waitFor(() => expect(result.current.meals).toEqual([]));
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("refresh で再取得して meals を更新する", async () => {
    queryResultMock.mockReturnValue({ data: [makeMeal("1")], error: null });
    const { result } = renderUseMeals();
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = [makeMeal("2"), makeMeal("1")];
    queryResultMock.mockReturnValue({ data: updated, error: null });
    act(() => result.current.refresh());

    await waitFor(() => expect(result.current.meals).toEqual(updated));
    expect(fromMock).toHaveBeenCalledTimes(2);
  });

  it("refresh が失敗したらエラートーストを出し、meals は保持する", async () => {
    const initial = [makeMeal("1")];
    queryResultMock.mockReturnValue({ data: initial, error: null });
    const { result } = renderUseMeals();
    await waitFor(() => expect(result.current.loading).toBe(false));

    queryResultMock.mockReturnValue({ data: null, error: new Error("boom") });
    act(() => result.current.refresh());

    await waitFor(() =>
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "食事の取得に失敗しました",
        type: "error",
      }),
    );
    expect(result.current.meals).toEqual(initial);
  });

  it("setMeals で呼び出し側から meals を直接更新できる", async () => {
    queryResultMock.mockReturnValue({
      data: [makeMeal("1"), makeMeal("2")],
      error: null,
    });
    const { result } = renderUseMeals();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() =>
      result.current.setMeals((prev) => prev.filter((m) => m.id !== "1")),
    );

    expect(result.current.meals.map((m) => m.id)).toEqual(["2"]);
  });
});
