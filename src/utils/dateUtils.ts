const pad = (n: number) => String(n).padStart(2, "0");

export const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// toDateStr の逆。YYYY-MM-DD をローカル時刻の 0 時の Date にする
export const fromDateStr = (dateStr: string): Date =>
  new Date(`${dateStr}T00:00:00`);

export const formatDisplayDate = (date: Date): string =>
  date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatGroupDate = (dateStr: string): string =>
  fromDateStr(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

// 月を表す YYYY-MM（meals.eaten_at の先頭7文字と一致するので前方一致で絞り込める）
export const toMonthStr = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

// YYYY-MM を delta か月ずらす（年をまたいでもよい）
export const shiftMonth = (monthStr: string, delta: number): string => {
  const [year, month] = monthStr.split("-").map(Number);
  return toMonthStr(new Date(year, month - 1 + delta, 1));
};

// YYYY-MM → 「2026年11月」
export const formatMonthLabel = (monthStr: string): string => {
  const [year, month] = monthStr.split("-").map(Number);
  return `${year}年${month}月`;
};
