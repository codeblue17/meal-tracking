export type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  user_id: string;
  name: string;
  meal_time: MealTime;
  eaten_at: string;
  memo: string | null;
  image_path: string | null;
  created_at: string;
};

// 一覧表示に使う項目。共有ページの食事（user_id / created_at を持たない）も表示できるよう Meal から切り出す
export type MealSummary = Pick<
  Meal,
  "id" | "name" | "meal_time" | "eaten_at" | "memo" | "image_path"
>;
