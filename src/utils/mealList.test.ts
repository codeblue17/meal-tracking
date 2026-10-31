import { describe, it, expect } from "vitest";
import { groupByDate, sortMealsForList } from "@/utils/mealList";
import type { MealSummary, MealTime } from "@/types/meal";

const meal = (id: string, eatenAt: string, mealTime: MealTime): MealSummary => ({
  id,
  name: `食事${id}`,
  meal_time: mealTime,
  eaten_at: eatenAt,
  memo: null,
  image_path: null,
});

const MEALS = [
  meal("1", "2026-10-01", "dinner"),
  meal("2", "2026-10-05", "snack"),
  meal("3", "2026-10-01", "breakfast"),
  meal("4", "2026-10-05", "lunch"),
];

describe("sortMealsForList", () => {
  it("日付の新しい順、同じ日付は時間帯順に並べる", () => {
    expect(sortMealsForList(MEALS).map((m) => m.id)).toEqual([
      "4",
      "2",
      "3",
      "1",
    ]);
  });

  it("元の配列は並べ替えない", () => {
    const input = [...MEALS];
    sortMealsForList(input);
    expect(input).toEqual(MEALS);
  });
});

describe("groupByDate", () => {
  it("日付ごとにまとめ、新しい日付を上・日付内は時間帯順にする", () => {
    expect(
      groupByDate(MEALS).map((g) => ({
        date: g.date,
        ids: g.meals.map((m) => m.id),
      })),
    ).toEqual([
      { date: "2026-10-05", ids: ["4", "2"] },
      { date: "2026-10-01", ids: ["3", "1"] },
    ]);
  });

  it("食事が無ければ空配列", () => {
    expect(groupByDate([])).toEqual([]);
  });
});
