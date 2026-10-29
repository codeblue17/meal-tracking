import { MEAL_MEMO_MAX_LENGTH, MEAL_NAME_MAX_LENGTH } from "@/constants/meal";

export type MealInputValidation =
  | { ok: true; name: string; memo: string }
  | { ok: false; message: string };

// 前後の空白を除いたうえで食事名・メモをチェックし、保存に使う値を返す
export const validateMealInput = (
  name: string,
  memo: string,
): MealInputValidation => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, message: "食事名を入力してください" };
  }
  if (trimmedName.length > MEAL_NAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `食事名は${MEAL_NAME_MAX_LENGTH}文字以内で入力してください`,
    };
  }
  const trimmedMemo = memo.trim();
  if (trimmedMemo.length > MEAL_MEMO_MAX_LENGTH) {
    return {
      ok: false,
      message: `メモは${MEAL_MEMO_MAX_LENGTH}文字以内で入力してください`,
    };
  }
  return { ok: true, name: trimmedName, memo: trimmedMemo };
};
