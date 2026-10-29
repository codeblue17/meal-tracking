import { describe, it, expect } from "vitest";
import { validateMealInput } from "@/utils/mealValidation";

describe("validateMealInput", () => {
  it("前後の空白を除いた食事名・メモを返す", () => {
    expect(validateMealInput("  定食  ", "  おいしい ")).toEqual({
      ok: true,
      name: "定食",
      memo: "おいしい",
    });
  });

  it("メモは空でもよい", () => {
    expect(validateMealInput("定食", "   ")).toEqual({
      ok: true,
      name: "定食",
      memo: "",
    });
  });

  it("食事名が空白だけならエラー", () => {
    expect(validateMealInput("   ", "")).toEqual({
      ok: false,
      message: "食事名を入力してください",
    });
  });

  it("食事名は100文字までOK、101文字はエラー", () => {
    expect(validateMealInput("あ".repeat(100), "").ok).toBe(true);
    expect(validateMealInput("あ".repeat(101), "")).toEqual({
      ok: false,
      message: "食事名は100文字以内で入力してください",
    });
  });

  it("文字数は空白を除いてから数える", () => {
    expect(validateMealInput(` ${"あ".repeat(100)} `, "").ok).toBe(true);
  });

  it("メモは500文字までOK、501文字はエラー", () => {
    expect(validateMealInput("定食", "あ".repeat(500)).ok).toBe(true);
    expect(validateMealInput("定食", "あ".repeat(501))).toEqual({
      ok: false,
      message: "メモは500文字以内で入力してください",
    });
  });
});
