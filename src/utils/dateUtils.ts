const pad = (n: number) => String(n).padStart(2, "0");

export const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatDisplayDate = (date: Date): string =>
  date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
