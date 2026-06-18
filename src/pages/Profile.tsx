import { memo, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import type { User } from "@supabase/supabase-js";
import { inputStyle } from "@/styles/formStyles";

const getInitials = (user: User | null) => {
  const name = user?.user_metadata?.full_name as string | undefined;
  if (name) return name.charAt(0).toUpperCase();
  if (user?.email) return user.email.charAt(0).toUpperCase();
  return "?";
};

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));

export const Profile: FC = memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState<string>(
    (user?.user_metadata?.full_name as string) ?? "",
  );
  const [nameLoading, setNameLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveName = async () => {
    if (!supabase) return;
    setNameLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });
      if (error) throw error;
      toaster.create({ title: "表示名を更新しました", type: "success" });
    } catch {
      toaster.create({ title: "更新に失敗しました", type: "error" });
    } finally {
      setNameLoading(false);
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
          <Flex
            direction="column"
            align="center"
            py={10}
            px={{ base: 6, md: 12 }}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Flex
              boxSize={20}
              borderRadius="full"
              bg="teal.500"
              color="white"
              align="center"
              justify="center"
              fontSize="2xl"
              fontWeight="bold"
              boxShadow="0 8px 24px rgba(20, 184, 166, 0.28)"
              mb={4}
            >
              {getInitials(user)}
            </Flex>
            <Heading as="h2" fontSize="xl" color="gray.900" mb={1}>
              {(user?.user_metadata?.full_name as string) || "未設定"}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {user?.email}
            </Text>
          </Flex>

          {/* アカウント情報 */}
          <Box
            px={{ base: 6, md: 12 }}
            py={8}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Text color="teal.600" fontWeight="semibold" fontSize="xl" mb={5}>
              アカウント情報
            </Text>
            <Stack gap={4}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  メールアドレス
                </Text>
                <Text fontSize="sm" color="gray.800" fontWeight="medium">
                  {user?.email}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  登録日
                </Text>
                <Text fontSize="sm" color="gray.800" fontWeight="medium">
                  {user?.created_at ? formatDate(user.created_at) : "—"}
                </Text>
              </Flex>
            </Stack>
          </Box>

          {/* プロフィール編集 */}
          <Box
            px={{ base: 6, md: 12 }}
            py={8}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Text color="teal.600" fontWeight="semibold" fontSize="xl" mb={5}>
              プロフィール編集
            </Text>
            <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
              表示名
            </Text>
            <Flex gap={3}>
              <Input
                placeholder="表示名を入力"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                {...inputStyle}
              />
              <PrimaryButton
                px={6}
                loading={nameLoading}
                onClick={handleSaveName}
                flexShrink={0}
              >
                保存
              </PrimaryButton>
            </Flex>
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
