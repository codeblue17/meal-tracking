import type { MealSummary } from "@/types/meal";
import type { GoalType } from "@/constants/goal";

// meal_shares テーブルの行（共有リンク）
export type MealShare = {
  id: string;
  token: string;
  label: string;
  start_date: string;
  // null は継続共有（start_date 以降の記録をすべて共有）
  end_date: string | null;
  expires_at: string;
  revoked_at: string | null;
  include_memo: boolean;
  include_images: boolean;
  created_at: string;
};

// get_shared_meals RPC の戻り値（有効なリンク）
export type SharedMeals = {
  status: "ok";
  owner_name: string | null;
  goal_type: GoalType | null;
  goal_detail: string | null;
  label: string;
  start_date: string;
  end_date: string | null;
  expires_at: string;
  include_memo: boolean;
  include_images: boolean;
  // 共有設定でメモ・写真を含めない場合、memo / image_path は null
  meals: MealSummary[];
};

// get_shared_meals RPC の戻り値。トークンが無い・期限切れ（無効化済みを含む）の場合は status だけ
export type SharedMealsResult =
  | SharedMeals
  | { status: "not_found" }
  | { status: "expired" };
