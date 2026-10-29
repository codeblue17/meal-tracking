import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import type { Meal, MealTime } from "@/types/meal";
import { toDateStr } from "@/utils/dateUtils";
import { deleteMealImage, uploadMealImage } from "@/utils/imageUpload";
import { validateMealInput } from "@/utils/mealValidation";
import { notifyMealsChanged } from "@/lib/mealEvents";

export type MealFormValues = {
  name: string;
  mealTime: MealTime;
  eatenDate: Date;
  memo: string;
  // 新しく選んだ画像。null なら画像は変更しない（removeExistingImage が true なら削除）
  imageFile: File | null;
  removeExistingImage: boolean;
};

// 画像の削除は後片付けなので、失敗しても呼び出し元の処理を止めない
const deleteMealImageQuietly = async (path: string) => {
  try {
    await deleteMealImage(path);
  } catch {
    // 消せなかった画像はストレージに残るが、食事データには影響しない
  }
};

// 食事の新規登録・更新を行う。initialMeal があれば更新、無ければ新規登録。
// 結果はトーストで通知し、saveMeal は保存できたら true を返す
export const useSaveMeal = (initialMeal?: Meal) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const saveMeal = useCallback(
    async (values: MealFormValues): Promise<boolean> => {
      if (!supabase || !user) return false;
      const validation = validateMealInput(values.name, values.memo);
      if (!validation.ok) {
        toaster.create({ title: validation.message, type: "error" });
        return false;
      }

      setSaving(true);
      // 今回アップロードした画像。DB への保存に失敗したら消して、参照されない画像を残さない
      let uploadedPath: string | null = null;
      try {
        let imagePath = initialMeal?.image_path ?? null;
        if (values.imageFile) {
          uploadedPath = await uploadMealImage(user.id, values.imageFile);
          imagePath = uploadedPath;
        } else if (values.removeExistingImage) {
          imagePath = null;
        }

        const row = {
          name: validation.name,
          meal_time: values.mealTime,
          eaten_at: toDateStr(values.eatenDate),
          memo: validation.memo || null,
          image_path: imagePath,
        };

        const { error } = initialMeal
          ? await supabase.from("meals").update(row).eq("id", initialMeal.id)
          : await supabase.from("meals").insert({ user_id: user.id, ...row });
        if (error) throw error;
      } catch {
        if (uploadedPath) await deleteMealImageQuietly(uploadedPath);
        toaster.create({
          title: initialMeal ? "更新に失敗しました" : "記録に失敗しました",
          type: "error",
        });
        setSaving(false);
        return false;
      }

      // ここから先は保存済み。画像を差し替え・削除した場合は古い画像をストレージから消す
      // （消せなくても保存自体は成功しているので、失敗扱いにはしない）
      if (
        initialMeal?.image_path &&
        (values.imageFile || values.removeExistingImage)
      ) {
        await deleteMealImageQuietly(initialMeal.image_path);
      }
      toaster.create({
        title: initialMeal ? "食事を更新しました" : "食事を記録しました",
        type: "success",
      });
      notifyMealsChanged();
      setSaving(false);
      return true;
    },
    [user, initialMeal],
  );

  return { saveMeal, saving };
};
