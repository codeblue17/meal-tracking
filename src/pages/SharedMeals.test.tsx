import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { SharedMeals } from "@/pages/SharedMeals";
import type { SharedMeals as SharedMealsData } from "@/types/mealShare";
import type { MealSummary, MealTime } from "@/types/meal";

const { useSharedMealsMock } = vi.hoisted(() => ({
  useSharedMealsMock: vi.fn(),
}));

vi.mock("@/hooks/useSharedMeals", () => ({
  useSharedMeals: useSharedMealsMock,
}));

vi.mock("@/lib/supabase", () => ({ supabase: null }));

const meal = (
  id: string,
  eatenAt: string,
  mealTime: MealTime,
  memo: string | null = null,
): MealSummary => ({
  id,
  name: `食事${id}`,
  meal_time: mealTime,
  eaten_at: eatenAt,
  memo,
  image_path: null,
});

const makeShared = (overrides: Partial<SharedMealsData> = {}): SharedMealsData => ({
  status: "ok",
  owner_name: "テスト太郎",
  goal_type: "weight_loss",
  goal_detail: "3kg減",
  label: "山田先生",
  start_date: "2026-10-01",
  end_date: null,
  expires_at: new Date(2026, 10, 28, 12).toISOString(),
  include_memo: true,
  include_images: false,
  meals: [
    meal("1", "2026-10-05", "dinner", "ご飯少なめ"),
    meal("2", "2026-10-05", "breakfast"),
    meal("3", "2026-10-01", "lunch"),
  ],
  ...overrides,
});

const mockHook = (value: Partial<ReturnType<typeof hookValue>>) =>
  useSharedMealsMock.mockReturnValue({ ...hookValue(), ...value });

const hookValue = () => ({
  result: makeShared() as SharedMealsData | { status: "not_found" | "expired" } | null,
  loading: false,
  error: false,
});

const renderPage = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter initialEntries={["/share/token-1"]}>
        <Routes>
          <Route path="/share/:token" element={<SharedMeals />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockHook({});
});

describe("SharedMeals - 有効なリンク", () => {
  it("URL のトークンで共有データを取得する", () => {
    renderPage();
    expect(useSharedMealsMock).toHaveBeenCalledWith("token-1");
  });

  it("だれの記録か・共有先・目標・見せる記録・見せる内容・期限を表示する", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "テスト太郎さんの食事記録" }),
    ).toBeInTheDocument();
    expect(screen.getByText("閲覧専用")).toBeInTheDocument();
    expect(screen.getByText("共有先：山田先生")).toBeInTheDocument();
    expect(screen.getByText("目標：減量（3kg減）")).toBeInTheDocument();
    expect(
      screen.getByText("見せる記録：2026年10月1日の食事から継続"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("見せる内容：食事名・時間帯・メモ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("リンクを開ける期限：2026年11月28日まで"),
    ).toBeInTheDocument();
  });

  it("表示名・目標が未設定でも表示できる", () => {
    mockHook({
      result: makeShared({ owner_name: null, goal_type: null, goal_detail: null }),
    });
    renderPage();
    expect(
      screen.getByRole("heading", { name: "共有された食事記録" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^目標：/)).not.toBeInTheDocument();
  });

  it("記録の件数・記録した日数・時間帯の割合を表示する", () => {
    renderPage();
    expect(screen.getByText("食事の記録").previousSibling).toHaveTextContent(
      "3件",
    );
    expect(screen.getByText("記録した日数").previousSibling).toHaveTextContent(
      "2日",
    );
    expect(screen.getByText("時間帯の割合")).toBeInTheDocument();
  });

  it("食事を日付ごとに表示し、編集・削除ボタンは出さない", () => {
    renderPage();
    expect(screen.getByText("食事1")).toBeInTheDocument();
    expect(screen.getByText("ご飯少なめ")).toBeInTheDocument();
    expect(screen.getByText("2026年10月5日(月)")).toBeInTheDocument();
    expect(screen.getByText("2026年10月1日(木)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "編集" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  });

  it("10件を超えるとページを分ける", async () => {
    const meals = Array.from({ length: 12 }, (_, i) =>
      meal(String(i + 1), `2026-10-${String(i + 1).padStart(2, "0")}`, "lunch"),
    );
    mockHook({ result: makeShared({ meals }) });
    renderPage();

    // 新しい日付順なので1ページ目は 10/12〜10/03
    expect(screen.getByText("食事12")).toBeInTheDocument();
    expect(screen.queryByText("食事2")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("食事2")).toBeInTheDocument();
    expect(screen.queryByText("食事12")).not.toBeInTheDocument();
  });

  it("範囲内に記録が無ければその旨を表示する", () => {
    mockHook({ result: makeShared({ meals: [] }) });
    renderPage();
    expect(
      screen.getByText("この範囲の食事記録はまだありません"),
    ).toBeInTheDocument();
  });

  it("検索エンジンに載せないよう noindex を指定する", () => {
    renderPage();
    expect(
      document.head.querySelector('meta[name="robots"]'),
    ).toHaveAttribute("content", "noindex, nofollow");
  });
});

describe("SharedMeals - 表示できないとき", () => {
  it("読み込み中は記録を表示しない", () => {
    mockHook({ result: null, loading: true });
    renderPage();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("期限切れ・無効化済みのリンク", () => {
    mockHook({ result: { status: "expired" } });
    renderPage();
    expect(
      screen.getByRole("heading", { name: "このリンクは有効期限が切れています" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("食事1")).not.toBeInTheDocument();
  });

  it("存在しないリンク", () => {
    mockHook({ result: { status: "not_found" } });
    renderPage();
    expect(
      screen.getByRole("heading", { name: "リンクが無効です" }),
    ).toBeInTheDocument();
  });

  it("読み込みに失敗したとき", () => {
    mockHook({ result: null, error: true });
    renderPage();
    expect(
      screen.getByRole("heading", { name: "読み込みに失敗しました" }),
    ).toBeInTheDocument();
  });
});
