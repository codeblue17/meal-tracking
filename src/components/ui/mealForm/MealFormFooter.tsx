import { memo } from "react";
import type { FC } from "react";
import { Button, Dialog, Flex } from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type MealFormFooterProps = {
  // 送信ボタンを紐付ける <form> の id（ボタンがフォームの外にあるため form 属性で指定する）
  formId: string;
  isEdit: boolean;
  loading: boolean;
  onCancel: () => void;
};

export const MealFormFooter: FC<MealFormFooterProps> = memo(
  ({ formId, isEdit, loading, onCancel }) => (
    <Dialog.Footer borderTop="1px solid" borderColor="gray.100" pt={4}>
      <Flex gap={3} w="full">
        <Button
          flex={1}
          size="lg"
          borderRadius="xl"
          variant="outline"
          color="gray.500"
          borderColor="gray.200"
          onClick={onCancel}
          _hover={{ bg: "gray.50" }}
        >
          キャンセル
        </Button>
        <PrimaryButton flex={2} type="submit" form={formId} loading={loading}>
          {isEdit ? "更新する" : "記録する"}
        </PrimaryButton>
      </Flex>
    </Dialog.Footer>
  ),
);
