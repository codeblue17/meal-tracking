import { describe, it, expect } from "vitest";
import {
  toDateStr,
  fromDateStr,
  formatDisplayDate,
  toMonthStr,
  shiftMonth,
  formatMonthLabel,
} from "@/utils/dateUtils";

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

describe("toMonthStr", () => {
  it("YYYY-MM 形式で返し、月をゼロ埋めする", () => {
    expect(toMonthStr(new Date(2026, 0, 31))).toBe("2026-01");
    expect(toMonthStr(new Date(2026, 10, 1))).toBe("2026-11");
  });
});

describe("shiftMonth", () => {
  it("前後の月に移動する", () => {
    expect(shiftMonth("2026-06", -1)).toBe("2026-05");
    expect(shiftMonth("2026-06", 1)).toBe("2026-07");
  });

  it("年をまたぐ", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });
});

describe("formatMonthLabel", () => {
  it("「YYYY年M月」で返す", () => {
    expect(formatMonthLabel("2026-01")).toBe("2026年1月");
    expect(formatMonthLabel("2026-11")).toBe("2026年11月");
  });
});
