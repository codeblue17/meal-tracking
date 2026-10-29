import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import { useMealShares } from "@/hooks/useMealShares";
import type { ShareFormValues } from "@/hooks/useMealShares";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";
import type { MealShare } from "@/types/mealShare";

// supabase.from("meal_shares") 以降のチェーン（select / eq / is / gt / order / insert / single / update）を再現する。
// どのメソッドもチェーン自身を返し、await されると queryResultMock の戻り値で解決する
const { fromMock, chain, queryResultMock } = vi.hoisted(() => {
  const queryResultMock = vi.fn();
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    gt: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
    then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(queryResultMock()).then(resolve, reject),
  };
  const fromMock = vi.fn(() => chain);
  return { fromMock, chain, queryResultMock };
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

const makeShare = (id: string): MealShare => ({
  id,
  token: `token-${id}`,
  label: `先生${id}`,
  start_date: "2026-10-01",
  end_date: null,
  expires_at: "2026-11-28T03:00:00.000Z",
  revoked_at: null,
  include_memo: false,
  include_images: false,
  created_at: "2026-10-29T03:00:00Z",
});

const FORM_VALUES: ShareFormValues = {
  label: "  山田先生 ",
  startDate: new Date(2026, 9, 1),
  endDate: new Date(2026, 9, 31),
  expiry: "30",
  includeMemo: true,
  includeImages: false,
};

const renderUseMealShares = () => {
  const authValue: AuthContextType = {
    user: { id: "user-1" } as User,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
  return renderHook(() => useMealShares(), { wrapper });
};

// 初回取得を終えた状態で返す
const renderLoaded = async (shares: MealShare[] = []) => {
  queryResultMock.mockReturnValueOnce({ data: shares, error: null });
  const hook = renderUseMealShares();
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  for (const method of Object.values(chain)) {
    if (vi.isMockFunction(method)) method.mockImplementation(() => chain);
  }
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-29T03:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useMealShares", () => {
  it("マウント時に自分の有効な共有リンクを新しい順に取得する", async () => {
    const shares = [makeShare("1"), makeShare("2")];
    const { result } = await renderLoaded(shares);

    expect(result.current.shares).toEqual(shares);
    expect(fromMock).toHaveBeenCalledWith("meal_shares");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(chain.is).toHaveBeenCalledWith("revoked_at", null);
    expect(chain.gt).toHaveBeenCalledWith(
      "expires_at",
      "2026-10-29T03:00:00.000Z",
    );
    expect(chain.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("取得に失敗したらエラーのトーストを出す", async () => {
    queryResultMock.mockReturnValueOnce({ data: null, error: new Error("x") });
    const { result } = renderUseMealShares();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.shares).toEqual([]);
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "共有リンクの取得に失敗しました",
      type: "error",
    });
  });

  it("発行すると整えた値を insert し、一覧の先頭に追加する", async () => {
    const { result } = await renderLoaded([makeShare("1")]);
    const created = makeShare("new");
    queryResultMock.mockReturnValueOnce({ data: created, error: null });

    let returned: MealShare | null = null;
    await act(async () => {
      returned = await result.current.createShare(FORM_VALUES);
    });

    // user_id・token は送らない（DB 側で自動設定、クライアントには権限がない）
    expect(chain.insert).toHaveBeenCalledWith({
      label: "山田先生",
      start_date: "2026-10-01",
      end_date: "2026-10-31",
      expires_at: "2026-11-28T03:00:00.000Z",
      include_memo: true,
      include_images: false,
    });
    expect(chain.single).toHaveBeenCalled();
    expect(returned).toEqual(created);
    expect(result.current.shares.map((s) => s.id)).toEqual(["new", "1"]);
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "共有リンクを発行しました",
      type: "success",
    });
  });

  it("終了日なし（継続共有）は end_date を null で送る", async () => {
    const { result } = await renderLoaded();
    queryResultMock.mockReturnValueOnce({ data: makeShare("new"), error: null });

    await act(async () => {
      await result.current.createShare({ ...FORM_VALUES, endDate: null });
    });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ end_date: null }),
    );
  });

  it("入力が不正なら insert せず、エラーのトーストを出して null を返す", async () => {
    const { result } = await renderLoaded();

    let returned: MealShare | null = makeShare("dummy");
    await act(async () => {
      returned = await result.current.createShare({
        ...FORM_VALUES,
        label: "   ",
      });
    });

    expect(returned).toBeNull();
    expect(chain.insert).not.toHaveBeenCalled();
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "共有相手の名前を入力してください",
      type: "error",
    });
  });

  it("発行に失敗したらエラーのトーストを出し、一覧は変えない", async () => {
    const { result } = await renderLoaded([makeShare("1")]);
    queryResultMock.mockReturnValueOnce({ data: null, error: new Error("x") });

    let returned: MealShare | null = makeShare("dummy");
    await act(async () => {
      returned = await result.current.createShare(FORM_VALUES);
    });

    expect(returned).toBeNull();
    expect(result.current.shares.map((s) => s.id)).toEqual(["1"]);
    expect(result.current.creating).toBe(false);
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "共有リンクの発行に失敗しました",
      type: "error",
    });
  });

  it("無効化すると revoked_at を設定し、一覧から外す", async () => {
    const { result } = await renderLoaded([makeShare("1"), makeShare("2")]);
    queryResultMock.mockReturnValueOnce({ data: null, error: null });

    let ok = false;
    await act(async () => {
      ok = await result.current.revokeShare("1");
    });

    expect(ok).toBe(true);
    expect(chain.update).toHaveBeenCalledWith({
      revoked_at: "2026-10-29T03:00:00.000Z",
    });
    expect(chain.eq).toHaveBeenLastCalledWith("id", "1");
    expect(result.current.shares.map((s) => s.id)).toEqual(["2"]);
    expect(result.current.revokingId).toBeNull();
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "共有リンクを無効化しました",
      type: "success",
    });
  });

  it("無効化に失敗したらエラーのトーストを出し、一覧に残す", async () => {
    const { result } = await renderLoaded([makeShare("1")]);
    queryResultMock.mockReturnValueOnce({ data: null, error: new Error("x") });

    let ok = true;
    await act(async () => {
      ok = await result.current.revokeShare("1");
    });

    expect(ok).toBe(false);
    expect(result.current.shares.map((s) => s.id)).toEqual(["1"]);
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "共有リンクの無効化に失敗しました",
      type: "error",
    });
  });
});
