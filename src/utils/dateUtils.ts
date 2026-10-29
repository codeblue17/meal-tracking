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
