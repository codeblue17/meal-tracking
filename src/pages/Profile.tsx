import { memo, useCallback, useState } from "react";
import type { FC } from "react";
import { Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountInfoSection } from "@/components/profile/AccountInfoSection";
import { ProfileEditSection } from "@/components/profile/ProfileEditSection";
import { GoalSection } from "@/components/profile/GoalSection";
import type { GoalType } from "@/components/profile/GoalSection";
import { PasswordSection } from "@/components/profile/PasswordSection";
import { AccountActionsSection } from "@/components/profile/AccountActionsSection";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

export const Profile: FC = memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const openDeleteDialog = useCallback(() => setDeleteOpen(true), []);
  const closeDeleteDialog = useCallback(() => setDeleteOpen(false), []);

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
      <DeleteAccountDialog open={deleteOpen} onClose={closeDeleteDialog} />
    </Box>
  );
});
