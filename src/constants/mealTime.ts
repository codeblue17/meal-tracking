import type { MealTime } from "@/types/meal";

export type MealTimeMeta = {
  label: string;
  colorPalette: string;
  order: number;
};

// 時間帯ごとの表示メタ（ラベル・配色・並び順）。アプリ全体で共有する。
export const MEAL_TIME_META: Record<MealTime, MealTimeMeta> = {
  breakfast: { label: "朝食", colorPalette: "orange", order: 0 },
  lunch: { label: "昼食", colorPalette: "teal", order: 1 },
  dinner: { label: "夕食", colorPalette: "purple", order: 2 },
  snack: { label: "間食", colorPalette: "pink", order: 3 },
};

// order に従って並べた時間帯の配列
export const MEAL_TIME_ORDER: MealTime[] = (
  Object.keys(MEAL_TIME_META) as MealTime[]
).sort((a, b) => MEAL_TIME_META[a].order - MEAL_TIME_META[b].order);
