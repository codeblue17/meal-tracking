import { memo, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Button,
  Dialog,
  Grid,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountInfoSection } from "@/components/profile/AccountInfoSection";
import { ProfileEditSection } from "@/components/profile/ProfileEditSection";
import { inputStyle } from "@/styles/formStyles";

const GOAL_DETAIL_MAX_LENGTH = 200;

const GOAL_TYPES = [
  { value: "weight_loss", label: "減量" },
  { value: "weight_gain", label: "増量" },
  { value: "maintain", label: "健康維持" },
  { value: "muscle_gain", label: "筋力アップ" },
] as const;

type GoalType = (typeof GOAL_TYPES)[number]["value"];

export const Profile: FC = memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [goalType, setGoalType] = useState<GoalType | "">(
    (user?.user_metadata?.goal_type as GoalType) ?? "",
  );
  const [goalDetail, setGoalDetail] = useState<string>(
    (user?.user_metadata?.goal_detail as string) ?? "",
  );
  const [goalLoading, setGoalLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSaveGoal = async () => {
    if (!goalType) {
      toaster.create({ title: "目標タイプを選択してください", type: "error" });
      return;
    }
    if (!supabase) return;
    const trimmedGoalDetail = goalDetail.trim();
    if (trimmedGoalDetail.length > GOAL_DETAIL_MAX_LENGTH) {
      toaster.create({
        title: `具体的な目標は${GOAL_DETAIL_MAX_LENGTH}文字以内で入力してください`,
        type: "error",
      });
      return;
    }
    setGoalLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { goal_type: goalType, goal_detail: trimmedGoalDetail },
      });
      if (error) throw error;
      toaster.create({ title: "目標を保存しました", type: "success" });
    } catch {
      toaster.create({ title: "目標の保存に失敗しました", type: "error" });
    } finally {
      setGoalLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toaster.create({ title: "パスワードが一致しません", type: "error" });
      return;
    }
    if (!supabase) return;
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toaster.create({ title: "パスワードを変更しました", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toaster.create({
        title: "パスワードの変更に失敗しました",
        type: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          <Box
            px={{ base: 6, md: 12 }}
            py={8}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Text color="teal.600" fontWeight="semibold" fontSize="xl" mb={5}>
              目標設定
            </Text>
            <Stack gap={4}>
              <Box>
                <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                  目標タイプ
                </Text>
                <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                  {GOAL_TYPES.map((item) => {
                    const isSelected = goalType === item.value;
                    return (
                      <Button
                        key={item.value}
                        size="md"
                        borderRadius="xl"
                        variant={isSelected ? "solid" : "outline"}
                        colorPalette={isSelected ? "teal" : "gray"}
                        onClick={() => setGoalType(item.value)}
                        type="button"
                        fontWeight={isSelected ? "semibold" : "medium"}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </Grid>
              </Box>
              <Box>
                <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                  具体的な目標
                </Text>
                <Textarea
                  placeholder="例: 3ヶ月で体重を3kg減らす（任意）"
                  value={goalDetail}
                  onChange={(e) => setGoalDetail(e.target.value)}
                  maxLength={GOAL_DETAIL_MAX_LENGTH}
                  minH="100px"
                  resize="none"
                  {...inputStyle}
                />
              </Box>
              <PrimaryButton
                loading={goalLoading}
                onClick={handleSaveGoal}
                mt={1}
              >
                目標を保存する
              </PrimaryButton>
            </Stack>
          </Box>

          {/* パスワード変更 */}
          <Box
            px={{ base: 6, md: 12 }}
            py={8}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Text color="teal.600" fontWeight="semibold" fontSize="xl" mb={5}>
              パスワード変更
            </Text>
            <Stack gap={4}>
              <Box>
                <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                  新しいパスワード
                </Text>
                <Input
                  type="password"
                  placeholder="8文字以上"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  {...inputStyle}
                />
              </Box>
              <Box>
                <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
                  確認用パスワード
                </Text>
                <Input
                  type="password"
                  placeholder="もう一度入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  {...inputStyle}
                />
              </Box>
              <PrimaryButton
                loading={passwordLoading}
                onClick={handleChangePassword}
                mt={1}
              >
                パスワードを変更する
              </PrimaryButton>
            </Stack>
          </Box>

          {/* アカウント操作 */}
          <Box px={{ base: 6, md: 12 }} py={8}>
            <Text color="teal.600" fontWeight="semibold" fontSize="sm" mb={5}>
              アカウント操作
            </Text>
            <Stack gap={3}>
              <Button
                size="lg"
                borderRadius="xl"
                variant="outline"
                color="red.500"
                borderColor="red.200"
                w="full"
                onClick={handleSignOut}
                _hover={{
                  bg: "red.50",
                  borderColor: "red.300",
                  color: "red.600",
                }}
              >
                サインアウト
              </Button>
              <Button
                size="lg"
                borderRadius="xl"
                variant="ghost"
                color="gray.400"
                w="full"
                onClick={() => setDeleteOpen(true)}
                _hover={{ bg: "red.50", color: "red.600" }}
              >
                退会する
              </Button>
            </Stack>
          </Box>
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
