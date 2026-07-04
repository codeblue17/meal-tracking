import { memo, useState } from "react";
import React from "react";
import type { FC } from "react";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AuthLayout } from "../components/ui/layout/AuthLayout";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";

export const Login: FC = memo(() => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch {
      toaster.create({
        title: "ログインに失敗しました",
        description: "メールアドレスまたはパスワードが正しくありません",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      leadHeading={
        <>
          毎日の食事を、
          <br />
          無理なく記録。
        </>
      }
      leadDescription="食事履歴、体調、習慣の変化をひとつの場所で確認できます。"
      title="ログイン"
      description="アカウント情報を入力してください。"
      onSubmit={handleSubmit}
    >
      <Box>
        <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
          メールアドレス
        </Text>
        <Input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          {...inputStyle}
        />
      </Box>
      <Box>
        <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
          パスワード
        </Text>
        <Input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          {...inputStyle}
        />
      </Box>
      {/* <Flex justify="flex-end">
        <Link color="teal.600" fontSize="sm" fontWeight="medium">
          パスワードを忘れた方
        </Link>
      </Flex> */}
      <PrimaryButton type="submit" mt={2} loading={loading}>
        ログイン
      </PrimaryButton>
      <Flex justify="center" gap={1}>
        <Text color="gray.500" fontSize="sm">
          アカウントをお持ちでない方は
        </Text>
        <RouterLink to="/signup">
          <Text color="teal.600" fontSize="sm" fontWeight="medium">
            新規登録
          </Text>
        </RouterLink>
      </Flex>
    </AuthLayout>
  );
});
