import { describe, it, expect } from "vitest";
import { validateShareInput } from "@/utils/shareValidation";
import { SHARE_LABEL_MAX_LENGTH } from "@/constants/share";

const START = new Date(2026, 9, 1, 15, 0);

describe("validateShareInput", () => {
  it("前後の空白を除いた名前を返す", () => {
    expect(validateShareInput("  山田先生 ", START, null)).toEqual({
      ok: true,
      label: "山田先生",
    });
  });

  it("空白だけの名前はエラー", () => {
    expect(validateShareInput("   ", START, null)).toEqual({
      ok: false,
      message: "共有相手の名前を入力してください",
    });
  });

  it("上限ちょうどは可、上限を超えるとエラー", () => {
    expect(
      validateShareInput("あ".repeat(SHARE_LABEL_MAX_LENGTH), START, null).ok,
    ).toBe(true);
    expect(
      validateShareInput("あ".repeat(SHARE_LABEL_MAX_LENGTH + 1), START, null),
    ).toEqual({
      ok: false,
      message: `共有相手の名前は${SHARE_LABEL_MAX_LENGTH}文字以内で入力してください`,
    });
  });

  it("「いつの食事まで」が「いつの食事から」より前ならエラー", () => {
    expect(validateShareInput("先生", START, new Date(2026, 8, 30))).toEqual({
      ok: false,
      message: "「いつの食事まで」は「いつの食事から」以降の日付にしてください",
    });
  });

  it("「いつの食事から」と「いつの食事まで」が同じ日なら時刻に関係なく可", () => {
    expect(
      validateShareInput("先生", START, new Date(2026, 9, 1, 9, 0)).ok,
    ).toBe(true);
  });
});
