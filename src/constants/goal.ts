// 目標タイプ（user_metadata.goal_type）の選択肢。プロフィールの目標設定と共有ページの表示で共通に使う
export const GOAL_TYPES = [
  { value: "weight_loss", label: "減量" },
  { value: "weight_gain", label: "増量" },
  { value: "maintain", label: "健康維持" },
  { value: "muscle_gain", label: "筋力アップ" },
] as const;

export type GoalType = (typeof GOAL_TYPES)[number]["value"];
