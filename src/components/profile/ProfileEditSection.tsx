import { memo, useState } from "react";
import type { FC } from "react";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";

const DISPLAY_NAME_MAX_LENGTH = 20;

type ProfileEditSectionProps = {
  initialFullName: string | undefined;
};

export const ProfileEditSection: FC<ProfileEditSectionProps> = memo(
  ({ initialFullName }) => {
    const [displayName, setDisplayName] = useState(initialFullName ?? "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      if (!supabase) return;
      const trimmedName = displayName.trim();
      if (trimmedName.length > DISPLAY_NAME_MAX_LENGTH) {
        toaster.create({
          title: `表示名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください`,
          type: "error",
        });
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: trimmedName },
        });
        if (error) throw error;
        toaster.create({ title: "表示名を更新しました", type: "success" });
      } catch {
        toaster.create({ title: "更新に失敗しました", type: "error" });
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
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            {...inputStyle}
          />
          <PrimaryButton
            px={6}
            loading={loading}
            onClick={handleSave}
            flexShrink={0}
          >
            保存
          </PrimaryButton>
        </Flex>
      </Box>
    );
  },
);
