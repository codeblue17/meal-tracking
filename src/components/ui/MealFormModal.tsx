import React, { memo, useCallback, useEffect, useState } from "react";
import type { FC } from "react";
import { CloseButton, Dialog, Input, Stack, Textarea } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { FormField } from "@/components/ui/FormField";
import { MealFormFooter } from "@/components/ui/mealForm/MealFormFooter";
import { DateField } from "@/components/ui/DateField";
import { MealImagePicker } from "@/components/ui/mealForm/MealImagePicker";
import { ChoiceButtonGroup } from "@/components/ui/ChoiceButtonGroup";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_META, MEAL_TIME_ORDER } from "@/constants/mealTime";
import { inputStyle } from "@/styles/formStyles";
import { toDateStr } from "@/utils/dateUtils";
import {
  deleteMealImage,
  getMealImageUrl,
  uploadMealImage,
} from "@/utils/imageUpload";

type Props = {
  open: boolean;
  onClose: () => void;
  initialMeal?: Meal;
  initialMealTime?: MealTime;
};

// フォーム本体の id。フッターの送信ボタンが form 属性でこの id を参照する
const MEAL_FORM_ID = "meal-form";
const MEAL_NAME_MAX_LENGTH = 100;
const MEAL_MEMO_MAX_LENGTH = 500;
const MEAL_TIME_OPTIONS = MEAL_TIME_ORDER.map((mt) => ({
  value: mt,
  label: MEAL_TIME_META[mt].label,
}));

// フォーム状態を持つ内部コンポーネント。open=false でアンマウントされ、状態が自動リセットされる
const MealFormContent: FC<{
  onClose: () => void;
  initialMeal?: Meal;
  initialMealTime?: MealTime;
}> = memo(({ onClose, initialMeal, initialMealTime }) => {
  const isEdit = Boolean(initialMeal);
  const { user } = useAuth();
  const [name, setName] = useState(initialMeal?.name ?? "");
  const [mealTime, setMealTime] = useState<MealTime>(
    initialMeal?.meal_time ?? initialMealTime ?? "breakfast",
  );
  const [eatenDate, setEatenDate] = useState<Date>(
    initialMeal ? new Date(`${initialMeal.eaten_at}T00:00:00`) : new Date(),
  );
  const [memo, setMemo] = useState(initialMeal?.memo ?? "");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialMeal?.image_path ? getMealImageUrl(initialMeal.image_path) : null,
  );
  // blob URL はプレビューが差し替わったとき・フォームが閉じられたときに解放する
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSelectImage = useCallback((file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
    setRemoveExistingImage(false);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    setRemoveExistingImage(true);
  }, []);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      toaster.create({ title: "食事名を入力してください", type: "error" });
      return;
    }
    if (trimmedName.length > MEAL_NAME_MAX_LENGTH) {
      toaster.create({
        title: `食事名は${MEAL_NAME_MAX_LENGTH}文字以内で入力してください`,
        type: "error",
      });
      return;
    }
    const trimmedMemo = memo.trim();
    if (trimmedMemo.length > MEAL_MEMO_MAX_LENGTH) {
      toaster.create({
        title: `メモは${MEAL_MEMO_MAX_LENGTH}文字以内で入力してください`,
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      let imagePath = initialMeal?.image_path ?? null;
      if (imageFile) {
        imagePath = await uploadMealImage(user.id, imageFile);
      } else if (removeExistingImage) {
        imagePath = null;
      }

      if (isEdit && initialMeal) {
        const { error } = await supabase
          .from("meals")
          .update({
            name: trimmedName,
            meal_time: mealTime,
            eaten_at: toDateStr(eatenDate),
            memo: trimmedMemo || null,
            image_path: imagePath,
          })
          .eq("id", initialMeal.id);
        if (error) throw error;
        if (initialMeal.image_path && initialMeal.image_path !== imagePath) {
          await deleteMealImage(initialMeal.image_path);
        }
        toaster.create({ title: "食事を更新しました", type: "success" });
      } else {
        const { error } = await supabase.from("meals").insert({
          user_id: user.id,
          name: trimmedName,
          meal_time: mealTime,
          eaten_at: toDateStr(eatenDate),
          memo: trimmedMemo || null,
          image_path: imagePath,
        });
        if (error) throw error;
        toaster.create({ title: "食事を記録しました", type: "success" });
      }
      onClose();
    } catch {
      toaster.create({
        title: isEdit ? "更新に失敗しました" : "記録に失敗しました",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog.Body py={6}>
        <Stack as="form" id={MEAL_FORM_ID} onSubmit={handleSubmit} gap={5}>
          <FormField label="食事名">
            <Input
              placeholder="例: 鶏むね肉の定食"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={MEAL_NAME_MAX_LENGTH}
              {...inputStyle}
            />
          </FormField>

          <FormField label="写真">
            <MealImagePicker
              previewUrl={imagePreview}
              onSelect={handleSelectImage}
              onRemove={handleRemoveImage}
            />
          </FormField>

          <FormField label="時間帯">
            <ChoiceButtonGroup
              options={MEAL_TIME_OPTIONS}
              value={mealTime}
              onChange={setMealTime}
            />
          </FormField>

          <FormField label="日付">
            <DateField value={eatenDate} onChange={setEatenDate} />
          </FormField>

          <FormField label="メモ">
            <Textarea
              placeholder="食材・気づきなど（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={MEAL_MEMO_MAX_LENGTH}
              minH="100px"
              resize="none"
              {...inputStyle}
            />
          </FormField>
        </Stack>
      </Dialog.Body>

      <MealFormFooter
        formId={MEAL_FORM_ID}
        isEdit={isEdit}
        loading={loading}
        onCancel={onClose}
      />
    </>
  );
});

export const MealFormModal: FC<Props> = memo(
  ({ open, onClose, initialMeal, initialMealTime }) => {
    const isEdit = Boolean(initialMeal);
    return (
      <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
        <Dialog.Backdrop bg="blackAlpha.400" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="gray.50"
            borderRadius="2xl"
            boxShadow="0 24px 70px rgba(15, 23, 42, 0.16)"
            border="1px solid"
            borderColor="gray.100"
            maxW="480px"
            w="full"
            mx={4}
          >
            <Dialog.Header
              borderBottom="1px solid"
              borderColor="gray.100"
              pb={4}
            >
              <Dialog.Title color="gray.800" fontSize="lg">
                {isEdit ? "食事を編集" : "食事を記録"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" borderRadius="full" />
            </Dialog.CloseTrigger>
            {open && (
              <MealFormContent
                onClose={onClose}
                initialMeal={initialMeal}
                initialMealTime={initialMealTime}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  },
);
