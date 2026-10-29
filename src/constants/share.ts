// 共有相手の名前の上限。DB の制約（meal_shares_label_check）と合わせる
export const SHARE_LABEL_MAX_LENGTH = 50;

// 共有リンクの有効期限の選択肢（ChoiceButtonGroup で選ぶため value は文字列）
export const SHARE_EXPIRY_OPTIONS = [
  { value: "7", label: "7日間", days: 7 },
  { value: "30", label: "30日間", days: 30 },
  { value: "90", label: "90日間", days: 90 },
] as const;

export type ShareExpiry = (typeof SHARE_EXPIRY_OPTIONS)[number]["value"];
