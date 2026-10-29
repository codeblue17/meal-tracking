import { memo, useState } from "react";
import React from "react";
import type { FC } from "react";
import { Flex, Input, Text } from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AuthLayout } from "../components/ui/layout/AuthLayout";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";
import { FormField } from "@/components/ui/FormField";
import { PASSWORD_MIN_LENGTH } from "@/constants/auth";

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
      <FormField label="メールアドレス">
        <Input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          {...inputStyle}
        />
      </FormField>
      <FormField label="パスワード">
        <Input
          type="password"
          placeholder={`${PASSWORD_MIN_LENGTH}文字以上`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={PASSWORD_MIN_LENGTH}
          {...inputStyle}
        />
      </FormField>
      <FormField label="パスワード（確認）">
        <Input
          type="password"
          placeholder="もう一度入力"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          {...inputStyle}
        />
      </FormField>
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
