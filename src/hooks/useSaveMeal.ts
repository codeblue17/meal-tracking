import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import type { Meal, MealTime } from "@/types/meal";
import { toDateStr } from "@/utils/dateUtils";
import { deleteMealImage, uploadMealImage } from "@/utils/imageUpload";
import { validateMealInput } from "@/utils/mealValidation";

export type MealFormValues = {
  name: string;
  mealTime: MealTime;
  eatenDate: Date;
  memo: string;
  // 新しく選んだ画像。null なら画像は変更しない（removeExistingImage が true なら削除）
  imageFile: File | null;
  removeExistingImage: boolean;
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
      try {
        let imagePath = initialMeal?.image_path ?? null;
        if (values.imageFile) {
          imagePath = await uploadMealImage(user.id, values.imageFile);
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

        if (initialMeal) {
          const { error } = await supabase
            .from("meals")
            .update(row)
            .eq("id", initialMeal.id);
          if (error) throw error;
          // 画像を差し替え・削除した場合は古い画像をストレージから消す
          if (initialMeal.image_path && initialMeal.image_path !== imagePath) {
            await deleteMealImage(initialMeal.image_path);
          }
          toaster.create({ title: "食事を更新しました", type: "success" });
        } else {
          const { error } = await supabase
            .from("meals")
            .insert({ user_id: user.id, ...row });
          if (error) throw error;
          toaster.create({ title: "食事を記録しました", type: "success" });
        }
        return true;
      } catch {
        toaster.create({
          title: initialMeal ? "更新に失敗しました" : "記録に失敗しました",
          type: "error",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, initialMeal],
  );

  return { saveMeal, saving };
};
