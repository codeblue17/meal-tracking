import { memo, useCallback, useEffect, useState } from "react";
import type { FC, FormEvent } from "react";
import { CloseButton, Dialog, Input, Stack, Textarea } from "@chakra-ui/react";
import { useSaveMeal } from "@/hooks/useSaveMeal";
import { FormField } from "@/components/ui/FormField";
import { MealFormFooter } from "@/components/ui/mealForm/MealFormFooter";
import { DateField } from "@/components/ui/DateField";
import { MealImagePicker } from "@/components/ui/mealForm/MealImagePicker";
import { ChoiceButtonGroup } from "@/components/ui/ChoiceButtonGroup";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_META, MEAL_TIME_ORDER } from "@/constants/mealTime";
import { inputStyle } from "@/styles/formStyles";
import { MEAL_MEMO_MAX_LENGTH, MEAL_NAME_MAX_LENGTH } from "@/constants/meal";
import { getMealImageUrl } from "@/utils/imageUpload";

type Props = {
  open: boolean;
  onClose: () => void;
  initialMeal?: Meal;
  initialMealTime?: MealTime;
};

// フォーム本体の id。フッターの送信ボタンが form 属性でこの id を参照する
const MEAL_FORM_ID = "meal-form";
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
  const [name, setName] = useState(initialMeal?.name ?? "");
  const [mealTime, setMealTime] = useState<MealTime>(
    initialMeal?.meal_time ?? initialMealTime ?? "breakfast",
  );
  const [eatenDate, setEatenDate] = useState<Date>(
    initialMeal ? new Date(`${initialMeal.eaten_at}T00:00:00`) : new Date(),
  );
  const [memo, setMemo] = useState(initialMeal?.memo ?? "");
  const { saveMeal, saving } = useSaveMeal(initialMeal);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const saved = await saveMeal({
      name,
      mealTime,
      eatenDate,
      memo,
      imageFile,
      removeExistingImage,
    });
    if (saved) onClose();
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
        loading={saving}
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
