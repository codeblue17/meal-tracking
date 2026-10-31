import { describe, it, expect } from "vitest";
import {
  formatShareContents,
  formatShareExpiry,
  formatSharePeriod,
} from "@/utils/shareFormat";

describe("formatSharePeriod", () => {
  it("終了日なしは「〜の食事から継続」", () => {
    expect(formatSharePeriod("2026-10-01", null)).toBe(
      "2026年10月1日の食事から継続",
    );
  });

  it("終了日ありは「〜〜〜の食事」", () => {
    expect(formatSharePeriod("2026-10-01", "2026-10-31")).toBe(
      "2026年10月1日〜2026年10月31日の食事",
    );
  });
});

describe("formatShareContents", () => {
  it("食事名・時間帯は必ず含め、メモ・写真は設定に応じて足す", () => {
    expect(formatShareContents(false, false)).toBe("食事名・時間帯");
    expect(formatShareContents(true, false)).toBe("食事名・時間帯・メモ");
    expect(formatShareContents(false, true)).toBe("食事名・時間帯・写真");
    expect(formatShareContents(true, true)).toBe("食事名・時間帯・メモ・写真");
  });
});

describe("formatShareExpiry", () => {
  it("ローカル日付の「〜まで」にする", () => {
    expect(formatShareExpiry(new Date(2026, 10, 28, 12).toISOString())).toBe(
      "2026年11月28日まで",
    );
  });
});
