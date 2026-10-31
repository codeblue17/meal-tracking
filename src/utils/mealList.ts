import type { DateGroup } from "@/components/list/MealGroupList";
import type { MealSummary } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";

const compareMealTime = (a: MealSummary, b: MealSummary): number =>
  MEAL_TIME_META[a.meal_time].order - MEAL_TIME_META[b.meal_time].order;

// 一覧の表示順（日付の新しい順 → 日付内は時間帯順）に並べた新しい配列を返す。
// eaten_at は YYYY-MM-DD 形式のため文字列比較で並べられる
export const sortMealsForList = <T extends MealSummary>(meals: T[]): T[] =>
  [...meals].sort((a, b) => {
    if (a.eaten_at !== b.eaten_at) return a.eaten_at < b.eaten_at ? 1 : -1;
    return compareMealTime(a, b);
  });

// 食事を日付ごとにまとめ、新しい日付が上・日付内は時間帯順に並べる
export const groupByDate = (meals: MealSummary[]): DateGroup[] => {
  const map = new Map<string, MealSummary[]>();
  for (const meal of meals) {
    const list = map.get(meal.eaten_at);
    if (list) list.push(meal);
    else map.set(meal.eaten_at, [meal]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({ date, meals: items.sort(compareMealTime) }));
};
