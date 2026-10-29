import { SHARE_LABEL_MAX_LENGTH } from "@/constants/share";
import { toDateStr } from "@/utils/dateUtils";

export type ShareInputValidation =
  | { ok: true; label: string }
  | { ok: false; message: string };

// 共有相手の名前（前後の空白を除く）と見せる食事記録の範囲をチェックし、保存に使う名前を返す
export const validateShareInput = (
  label: string,
  startDate: Date,
  endDate: Date | null,
): ShareInputValidation => {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return { ok: false, message: "共有相手の名前を入力してください" };
  }
  if (trimmedLabel.length > SHARE_LABEL_MAX_LENGTH) {
    return {
      ok: false,
      message: `共有相手の名前は${SHARE_LABEL_MAX_LENGTH}文字以内で入力してください`,
    };
  }
  // 時刻を含めず日付だけで比べる（同じ日は可）
  if (endDate && toDateStr(startDate) > toDateStr(endDate)) {
    return {
      ok: false,
      message: "「いつの食事まで」は「いつの食事から」以降の日付にしてください",
    };
  }
  return { ok: true, label: trimmedLabel };
};
