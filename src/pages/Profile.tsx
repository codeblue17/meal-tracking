import { memo, useCallback, useState } from "react";
import type { FC } from "react";
import { Box, Button, Dialog, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountInfoSection } from "@/components/profile/AccountInfoSection";
import { ProfileEditSection } from "@/components/profile/ProfileEditSection";
import { GoalSection } from "@/components/profile/GoalSection";
import type { GoalType } from "@/components/profile/GoalSection";
import { PasswordSection } from "@/components/profile/PasswordSection";
import { AccountActionsSection } from "@/components/profile/AccountActionsSection";

export const Profile: FC = memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const openDeleteDialog = useCallback(() => setDeleteOpen(true), []);

  const handleDeleteAccount = async () => {
    if (!supabase) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
      await signOut();
      toaster.create({ title: "退会が完了しました", type: "success" });
      navigate("/");
    } catch {
      toaster.create({ title: "退会処理に失敗しました", type: "error" });
      setDeleteLoading(false);
    }
  };

  return (
    <Box
      bg="gray.50"
      minH="100svh"
      px={{ base: 4, md: 8 }}
      py={{ base: 8, md: 12 }}
    >
      <Box maxW="640px" mx="auto">
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.12)"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
        >
          {/* アバター・名前・メール */}
          <ProfileHeader
            fullName={user?.user_metadata?.full_name as string | undefined}
            email={user?.email}
          />

          {/* アカウント情報 */}
          <AccountInfoSection
            email={user?.email}
            createdAt={user?.created_at}
          />

          {/* プロフィール編集 */}
          <ProfileEditSection
            initialFullName={
              user?.user_metadata?.full_name as string | undefined
            }
          />

          {/* 目標設定 */}
          <GoalSection
            initialGoalType={
              user?.user_metadata?.goal_type as GoalType | undefined
            }
            initialGoalDetail={
              user?.user_metadata?.goal_detail as string | undefined
            }
          />

          {/* パスワード変更 */}
          <PasswordSection />

          {/* アカウント操作 */}
          <AccountActionsSection
            onSignOut={handleSignOut}
            onRequestDelete={openDeleteDialog}
          />
        </Box>
      </Box>

      {/* 退会確認ダイアログ */}
      <Dialog.Root
        open={deleteOpen}
        onOpenChange={(e) => !e.open && setDeleteOpen(false)}
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
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
              >
                キャンセル
              </Button>
              <Button
                colorPalette="red"
                borderRadius="xl"
                loading={deleteLoading}
                onClick={handleDeleteAccount}
              >
                退会する
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
});
