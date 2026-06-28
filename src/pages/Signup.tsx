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

export const Signup: FC = memo(() => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toaster.create({
        title: "パスワードが一致しません",
        description: "パスワードと確認用パスワードを同じ値にしてください",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation) {
        toaster.create({
          title: "確認メールを送信しました",
          description: "メールに記載のリンクをクリックしてアカウントを有効化してください",
          type: "success",
        });
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch {
      toaster.create({
        title: "登録に失敗しました",
        description: "入力内容を確認してもう一度お試しください",
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
          はじめての一歩を、
          <br />
          今日から。
        </>
      }
      leadDescription="アカウントを作成して、食事の記録をはじめましょう。"
      title="アカウント作成"
      description="メールアドレスとパスワードを入力してください。"
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
          placeholder="8文字以上"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          {...inputStyle}
        />
      </Box>
      <Box>
        <Text color="gray.700" fontSize="sm" fontWeight="medium" mb={2}>
          パスワード（確認）
        </Text>
        <Input
          type="password"
          placeholder="もう一度入力"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          {...inputStyle}
        />
      </Box>
      <PrimaryButton type="submit" mt={2} loading={loading}>
        アカウントを作成
      </PrimaryButton>
      <Flex justify="center" gap={1}>
        <Text color="gray.500" fontSize="sm">
          すでにアカウントをお持ちの方は
        </Text>
        <RouterLink to="/">
          <Text color="teal.600" fontSize="sm" fontWeight="medium">
            ログイン
          </Text>
        </RouterLink>
      </Flex>
    </AuthLayout>
  );
});
