import { describe, it, expect } from "vitest";
import { toDateStr, fromDateStr, formatDisplayDate } from "@/utils/dateUtils";

describe("toDateStr", () => {
  it("YYYY-MM-DD 形式で返す", () => {
    expect(toDateStr(new Date(2026, 5, 11))).toBe("2026-06-11");
  });

  it("月・日が1桁の場合ゼロ埋めする", () => {
    expect(toDateStr(new Date(2026, 0, 1))).toBe("2026-01-01");
  });

  it("月末日を正しく返す", () => {
    expect(toDateStr(new Date(2026, 1, 28))).toBe("2026-02-28");
  });
});

describe("formatDisplayDate", () => {
  it("日本語ロケールの日付文字列を返す", () => {
    expect(formatDisplayDate(new Date(2026, 5, 11))).toBe("2026年6月11日");
  });
});

describe("fromDateStr", () => {
  it("YYYY-MM-DD をローカル時刻の 0 時の Date にする", () => {
    expect(fromDateStr("2026-06-11")).toEqual(new Date(2026, 5, 11));
  });

  it("toDateStr と往復できる", () => {
    expect(toDateStr(fromDateStr("2026-01-01"))).toBe("2026-01-01");
  });
});
