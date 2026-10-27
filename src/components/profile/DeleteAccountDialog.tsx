import { memo, useState } from "react";
import type { FC } from "react";
import { Button, Dialog, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";

type DeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const DeleteAccountDialog: FC<DeleteAccountDialogProps> = memo(
  ({ open, onClose }) => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
      if (!supabase) return;
      setLoading(true);
      try {
        const { error } = await supabase.rpc("delete_user");
        if (error) throw error;
        await signOut();
        toaster.create({ title: "退会が完了しました", type: "success" });
        navigate("/");
      } catch {
        toaster.create({ title: "退会処理に失敗しました", type: "error" });
        setLoading(false);
      }
    };

    return (
      <Dialog.Root
        open={open}
        // 退会処理中は Esc・背景クリックでも閉じさせない（キャンセルボタンと挙動を揃える）
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
            <Dialog.Header
              borderBottom="1px solid"
              borderColor="gray.100"
              pb={4}
            >
              <Dialog.Title color="red.600" fontSize="lg">
                本当に退会しますか？
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py={6}>
              <Text fontSize="sm" color="gray.700" mb={3}>
                退会すると、以下のデータがすべて削除されます。この操作は取り消せません。
              </Text>
              <Stack gap={1} fontSize="sm" color="gray.600">
                <Text>
                  ・アカウント情報（メールアドレス・表示名・目標設定）
                </Text>
                <Text>・これまでに記録したすべての食事データ</Text>
              </Stack>
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
                onClick={handleDelete}
              >
                退会する
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  },
);
