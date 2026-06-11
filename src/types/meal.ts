export type MealTime = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  user_id: string;
  name: string;
  meal_time: MealTime;
  eaten_at: string;
  memo: string | null;
  created_at: string;
};
