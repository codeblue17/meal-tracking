import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import type { User } from "@supabase/supabase-js";
import { useSaveMeal } from "@/hooks/useSaveMeal";
import type { MealFormValues } from "@/hooks/useSaveMeal";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";
import type { Meal } from "@/types/meal";

// supabase.from("meals").insert(...) / .update(...).eq(...) を再現する
const { fromMock, insertMock, updateMock, eqMock } = vi.hoisted(() => {
  const eqMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ insert: insertMock, update: updateMock }));
  return { fromMock, insertMock, updateMock, eqMock };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

const { uploadMealImageMock, deleteMealImageMock } = vi.hoisted(() => ({
  uploadMealImageMock: vi.fn(),
  deleteMealImageMock: vi.fn(),
}));

vi.mock("@/utils/imageUpload", () => ({
  uploadMealImage: uploadMealImageMock,
  deleteMealImage: deleteMealImageMock,
}));

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

const renderUseSaveMeal = (initialMeal?: Meal) => {
  const authValue: AuthContextType = {
    user: { id: "user-1" } as User,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
  return renderHook(() => useSaveMeal(initialMeal), { wrapper });
};

const values = (overrides: Partial<MealFormValues> = {}): MealFormValues => ({
  name: "  鶏むね肉の定食  ",
  mealTime: "lunch",
  eatenDate: new Date(2026, 5, 11),
  memo: "",
  imageFile: null,
  removeExistingImage: false,
  ...overrides,
});

const existingMeal: Meal = {
  id: "meal-1",
  user_id: "user-1",
  name: "朝ごはん",
  meal_time: "breakfast",
  eaten_at: "2026-06-10",
  memo: "メモ",
  image_path: "user-1/old.jpg",
  created_at: "2026-06-10T08:00:00Z",
};

const save = async (
  result: { current: ReturnType<typeof useSaveMeal> },
  v: MealFormValues,
) => {
  let saved = false;
  await act(async () => {
    saved = await result.current.saveMeal(v);
  });
  return saved;
};

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
  eqMock.mockResolvedValue({ error: null });
  uploadMealImageMock.mockResolvedValue("user-1/new.jpg");
  deleteMealImageMock.mockResolvedValue(undefined);
});

describe("useSaveMeal - 新規登録", () => {
  it("入力値を整えて登録し、true を返す", async () => {
    const { result } = renderUseSaveMeal();
    const saved = await save(result, values());

    expect(saved).toBe(true);
    expect(fromMock).toHaveBeenCalledWith("meals");
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-1",
      name: "鶏むね肉の定食",
      meal_time: "lunch",
      eaten_at: "2026-06-11",
      memo: null,
      image_path: null,
    });
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "食事を記録しました",
      type: "success",
    });
    expect(result.current.saving).toBe(false);
  });

  it("画像を選んでいればアップロードしたパスで登録する", async () => {
    const { result } = renderUseSaveMeal();
    const file = new File(["x"], "meal.png", { type: "image/png" });
    await save(result, values({ imageFile: file }));

    expect(uploadMealImageMock).toHaveBeenCalledWith("user-1", file);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ image_path: "user-1/new.jpg" }),
    );
  });

  it("入力チェックに失敗したら保存せず false を返す", async () => {
    const { result } = renderUseSaveMeal();
    const saved = await save(result, values({ name: "   " }));

    expect(saved).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "食事名を入力してください",
      type: "error",
    });
  });

  it("登録に失敗したらエラーを通知して false を返す", async () => {
    insertMock.mockResolvedValue({ error: new Error("boom") });
    const { result } = renderUseSaveMeal();
    const saved = await save(result, values());

    expect(saved).toBe(false);
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "記録に失敗しました",
      type: "error",
    });
    expect(result.current.saving).toBe(false);
  });
});

describe("useSaveMeal - 更新", () => {
  it("対象の食事を更新し、画像を変えていなければ削除しない", async () => {
    const { result } = renderUseSaveMeal(existingMeal);
    const saved = await save(result, values({ memo: " 追記 " }));

    expect(saved).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({
      name: "鶏むね肉の定食",
      meal_time: "lunch",
      eaten_at: "2026-06-11",
      memo: "追記",
      image_path: "user-1/old.jpg",
    });
    expect(eqMock).toHaveBeenCalledWith("id", "meal-1");
    expect(insertMock).not.toHaveBeenCalled();
    expect(deleteMealImageMock).not.toHaveBeenCalled();
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "食事を更新しました",
      type: "success",
    });
  });

  it("画像を差し替えたら新しいパスで更新し、古い画像を削除する", async () => {
    const { result } = renderUseSaveMeal(existingMeal);
    const file = new File(["x"], "new.png", { type: "image/png" });
    await save(result, values({ imageFile: file }));

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ image_path: "user-1/new.jpg" }),
    );
    expect(deleteMealImageMock).toHaveBeenCalledWith("user-1/old.jpg");
  });

  it("画像を削除したら image_path を null にし、古い画像を削除する", async () => {
    const { result } = renderUseSaveMeal(existingMeal);
    await save(result, values({ removeExistingImage: true }));

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ image_path: null }),
    );
    expect(deleteMealImageMock).toHaveBeenCalledWith("user-1/old.jpg");
  });

  it("更新に失敗したら古い画像は消さず、エラーを通知する", async () => {
    eqMock.mockResolvedValue({ error: new Error("boom") });
    const { result } = renderUseSaveMeal(existingMeal);
    const saved = await save(result, values({ removeExistingImage: true }));

    expect(saved).toBe(false);
    expect(deleteMealImageMock).not.toHaveBeenCalled();
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "更新に失敗しました",
      type: "error",
    });
  });
});
