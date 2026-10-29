import { memo, useState } from "react";
import type { FC } from "react";
import { Box, Input, Stack, Text } from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";
import { FormField } from "@/components/ui/FormField";
import { PASSWORD_MIN_LENGTH } from "@/constants/auth";

export const PasswordSection: FC = memo(() => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      toaster.create({
        title: `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`,
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toaster.create({ title: "パスワードが一致しません", type: "error" });
      return;
    }
    if (!supabase) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
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
        <FormField label="新しいパスワード">
          <Input
            type="password"
            placeholder={`${PASSWORD_MIN_LENGTH}文字以上`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            {...inputStyle}
          />
        </FormField>
        <FormField label="確認用パスワード">
          <Input
            type="password"
            placeholder="もう一度入力"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            {...inputStyle}
          />
        </FormField>
        <PrimaryButton loading={loading} onClick={handleChange} mt={1}>
          パスワードを変更する
        </PrimaryButton>
      </Stack>
    </Box>
  );
});
