import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { computeStreak, lastNDays, useDashboardStats } from "@/hooks/useDashboardStats";
import { toDateStr } from "@/utils/dateUtils";
import type { Meal, MealTime } from "@/types/meal";

// 2026-06-11（木）12:00 に固定
const NOW = new Date(2026, 5, 11, 12, 0, 0);

let seq = 0;
const makeMeal = (overrides: Partial<Meal> = {}): Meal => {
  seq += 1;
  return {
    id: `meal-${seq}`,
    user_id: "user-1",
    name: `食事${seq}`,
    meal_time: "lunch",
    eaten_at: "2026-06-11",
    memo: null,
    image_path: null,
    created_at: `2026-06-11T12:00:${String(seq).padStart(2, "0")}Z`,
    ...overrides,
  };
};

beforeEach(() => {
  seq = 0;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("lastNDays", () => {
  it("今日を含む過去 n 日を古い順に返す", () => {
    expect(lastNDays(3).map(toDateStr)).toEqual([
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
    ]);
  });

  it("時刻は 0:00 に揃える", () => {
    const [day] = lastNDays(1);
    expect(day.getHours()).toBe(0);
    expect(day.getMinutes()).toBe(0);
  });

  it("月をまたいでも正しく遡る", () => {
    vi.setSystemTime(new Date(2026, 6, 2, 9, 0, 0)); // 2026-07-02
    expect(lastNDays(4).map(toDateStr)).toEqual([
      "2026-06-29",
      "2026-06-30",
      "2026-07-01",
      "2026-07-02",
    ]);
  });
});

describe("computeStreak", () => {
  it("記録が無ければ 0", () => {
    expect(computeStreak(new Set())).toBe(0);
  });

  it("今日から連続して記録がある日数を数える", () => {
    expect(
      computeStreak(new Set(["2026-06-09", "2026-06-10", "2026-06-11"])),
    ).toBe(3);
  });

  it("今日の記録が無くても昨日から連続していれば数える", () => {
    expect(computeStreak(new Set(["2026-06-09", "2026-06-10"]))).toBe(2);
  });

  it("昨日も今日も記録が無ければ、それ以前の記録があっても 0", () => {
    expect(computeStreak(new Set(["2026-06-08", "2026-06-09"]))).toBe(0);
  });

  it("途中で途切れたらそこで止まる", () => {
    expect(
      computeStreak(new Set(["2026-06-07", "2026-06-08", "2026-06-10", "2026-06-11"])),
    ).toBe(2);
  });

  it("月をまたいで連続を数える", () => {
    vi.setSystemTime(new Date(2026, 6, 1, 9, 0, 0)); // 2026-07-01
    expect(
      computeStreak(new Set(["2026-06-29", "2026-06-30", "2026-07-01"])),
    ).toBe(3);
  });
});

describe("useDashboardStats", () => {
  it("食事が無い場合は空の集計を返す", () => {
    const { result } = renderHook(() => useDashboardStats([]));
    const stats = result.current;

    expect(stats.todayCount).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.weekTotal).toBe(0);
    expect(stats.total).toBe(0);
    expect(stats.weeklyMax).toBe(1); // 0 除算を防ぐため最小 1
    expect(stats.recent).toEqual([]);
    expect(stats.weekly).toHaveLength(7);
    expect(stats.weekly.every((w) => w.count === 0)).toBe(true);
    expect(stats.distribution.map((d) => d.count)).toEqual([0, 0, 0, 0]);
    expect(stats.todaySlots.every((s) => s.meals.length === 0)).toBe(true);
  });

  it("今日・今週・全体の件数と連続記録を集計する", () => {
    const meals = [
      makeMeal({ eaten_at: "2026-06-11" }),
      makeMeal({ eaten_at: "2026-06-11" }),
      makeMeal({ eaten_at: "2026-06-10" }),
      makeMeal({ eaten_at: "2026-06-05" }), // 7日前の境界（今週に含む）
      makeMeal({ eaten_at: "2026-06-04" }), // 8日前（今週に含まない）
    ];
    const { result } = renderHook(() => useDashboardStats(meals));

    expect(result.current.todayCount).toBe(2);
    expect(result.current.weekTotal).toBe(4);
    expect(result.current.total).toBe(5);
    expect(result.current.streak).toBe(2);
  });

  it("週間アクティビティを過去7日・古い順で返す", () => {
    const meals = [
      makeMeal({ eaten_at: "2026-06-11" }),
      makeMeal({ eaten_at: "2026-06-09" }),
      makeMeal({ eaten_at: "2026-06-09" }),
      makeMeal({ eaten_at: "2026-06-09" }),
    ];
    const { result } = renderHook(() => useDashboardStats(meals));
    const { weekly, weeklyMax } = result.current;

    expect(weekly.map((w) => w.key)).toEqual([
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
      "2026-06-08",
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
    ]);
    expect(weekly.map((w) => w.weekday)).toEqual([
      "金",
      "土",
      "日",
      "月",
      "火",
      "水",
      "木",
    ]);
    expect(weekly.map((w) => w.count)).toEqual([0, 0, 0, 0, 3, 0, 1]);
    expect(weekly.map((w) => w.isToday)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(weeklyMax).toBe(3);
  });

  it("時間帯の割合を MEAL_TIME_ORDER の順で全期間から集計する", () => {
    const meals = [
      makeMeal({ meal_time: "dinner" }),
      makeMeal({ meal_time: "dinner", eaten_at: "2026-01-01" }),
      makeMeal({ meal_time: "breakfast" }),
      makeMeal({ meal_time: "snack", eaten_at: "2025-12-31" }),
    ];
    const { result } = renderHook(() => useDashboardStats(meals));

    expect(result.current.distribution).toEqual([
      { mealTime: "breakfast", count: 1 },
      { mealTime: "lunch", count: 0 },
      { mealTime: "dinner", count: 2 },
      { mealTime: "snack", count: 1 },
    ]);
  });

  it("今日の食事を時間帯ごとのスロットに作成順で振り分ける", () => {
    const later = makeMeal({
      meal_time: "lunch",
      created_at: "2026-06-11T13:00:00Z",
    });
    const earlier = makeMeal({
      meal_time: "lunch",
      created_at: "2026-06-11T11:00:00Z",
    });
    const breakfast = makeMeal({ meal_time: "breakfast" });
    const yesterday = makeMeal({ meal_time: "dinner", eaten_at: "2026-06-10" });

    const { result } = renderHook(() =>
      useDashboardStats([later, earlier, breakfast, yesterday]),
    );
    const slots = Object.fromEntries(
      result.current.todaySlots.map((s) => [s.mealTime, s.meals]),
    ) as Record<MealTime, Meal[]>;

    expect(result.current.todaySlots.map((s) => s.mealTime)).toEqual([
      "breakfast",
      "lunch",
      "dinner",
      "snack",
    ]);
    expect(slots.breakfast).toEqual([breakfast]);
    expect(slots.lunch).toEqual([earlier, later]);
    expect(slots.dinner).toEqual([]); // 昨日の夕食は含まない
    expect(slots.snack).toEqual([]);
  });

  it("最近の記録は先頭から最大5件を返す", () => {
    const meals = Array.from({ length: 7 }, () => makeMeal());
    const { result } = renderHook(() => useDashboardStats(meals));

    expect(result.current.recent).toEqual(meals.slice(0, 5));
  });

  it("同じ meals 参照なら再レンダーで同じ結果オブジェクトを返す", () => {
    const meals = [makeMeal()];
    const { result, rerender } = renderHook(() => useDashboardStats(meals));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
