import { memo } from "react";
import type { FC } from "react";
import { Button, Dialog, Text } from "@chakra-ui/react";

type RevokeShareDialogProps = {
  // 無効化するリンクの共有相手の名前。null のときは閉じている
  label: string | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const RevokeShareDialog: FC<RevokeShareDialogProps> = memo(
  ({ label, loading, onConfirm, onClose }) => (
    <Dialog.Root
      open={label !== null}
      // 無効化中は Esc・背景クリックでも閉じさせない（キャンセルボタンと挙動を揃える）
      onOpenChange={(e) => !e.open && !loading && onClose()}
      role="alertdialog"
    >
      <Dialog.Backdrop bg="blackAlpha.400" />
      <Dialog.Positioner>
        <Dialog.Content
          borderRadius="2xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.16)"
          border="1px solid"
          borderColor="gray.100"
          maxW="480px"
          w="full"
          mx={4}
        >
          <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb={4}>
            <Dialog.Title color="red.600" fontSize="lg">
              共有リンクを無効化しますか？
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body py={6}>
            <Text fontSize="sm" color="gray.700">
              「{label}」に渡したリンクから食事記録を見られなくなります。この操作は取り消せません。もう一度共有するときは、新しいリンクを発行してください。
            </Text>
          </Dialog.Body>
          <Dialog.Footer borderTop="1px solid" borderColor="gray.100" pt={4}>
            <Button
              variant="outline"
              borderRadius="xl"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              colorPalette="red"
              borderRadius="xl"
              loading={loading}
              onClick={onConfirm}
            >
              無効化する
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  ),
);
