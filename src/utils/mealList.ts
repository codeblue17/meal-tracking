import type { DateGroup } from "@/components/list/MealGroupList";
import type { MealSummary } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";

// 日付の並び順。desc = 新しい日付が上（既定）、asc = 古い日付が上
export type SortOrder = "desc" | "asc";

// eaten_at（YYYY-MM-DD）を文字列比較し、order の向きで並べる比較関数の値を返す
const compareDate = (a: string, b: string, order: SortOrder): number => {
  if (a === b) return 0;
  const asc = a < b ? -1 : 1;
  return order === "asc" ? asc : -asc;
};

const compareMealTime = (a: MealSummary, b: MealSummary): number =>
  MEAL_TIME_META[a.meal_time].order - MEAL_TIME_META[b.meal_time].order;

// 一覧の表示順（日付を order の向き → 日付内は時間帯順）に並べた新しい配列を返す。
// 日付内の時間帯順（朝→昼→夜→間食）は order に関係なく固定。
// eaten_at は YYYY-MM-DD 形式のため文字列比較で並べられる
export const sortMealsForList = <T extends MealSummary>(
  meals: T[],
  order: SortOrder = "desc",
): T[] =>
  [...meals].sort(
    (a, b) =>
      compareDate(a.eaten_at, b.eaten_at, order) || compareMealTime(a, b),
  );

// 食事を日付ごとにまとめ、日付を order の向き・日付内は時間帯順に並べる
export const groupByDate = (
  meals: MealSummary[],
  order: SortOrder = "desc",
): DateGroup[] => {
  const map = new Map<string, MealSummary[]>();
  for (const meal of meals) {
    const list = map.get(meal.eaten_at);
    if (list) list.push(meal);
    else map.set(meal.eaten_at, [meal]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => compareDate(a, b, order))
    .map(([date, items]) => ({ date, meals: items.sort(compareMealTime) }));
};
