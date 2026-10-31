import { formatDisplayDate, fromDateStr } from "@/utils/dateUtils";

// 見せる食事記録の範囲（食事をした日）。プロフィールの発行済みリンクと共有ページで同じ文言にする
export const formatSharePeriod = (
  startDate: string,
  endDate: string | null,
): string => {
  const start = formatDisplayDate(fromDateStr(startDate));
  return endDate
    ? `${start}〜${formatDisplayDate(fromDateStr(endDate))}の食事`
    : `${start}の食事から継続`;
};

// 見せる内容（食事名・時間帯は必ず含む）
export const formatShareContents = (
  includeMemo: boolean,
  includeImages: boolean,
): string =>
  ["食事名・時間帯", includeMemo && "メモ", includeImages && "写真"]
    .filter(Boolean)
    .join("・");

// リンクを開ける期限（expires_at はタイムスタンプ）
export const formatShareExpiry = (expiresAt: string): string =>
  `${formatDisplayDate(new Date(expiresAt))}まで`;
