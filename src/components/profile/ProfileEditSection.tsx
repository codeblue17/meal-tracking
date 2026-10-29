import { memo, useState } from "react";
import type { FC } from "react";
import { Flex, Input } from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";
import { FormField } from "@/components/ui/FormField";
import { ProfileSection } from "@/components/profile/ProfileSection";

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
      <ProfileSection title="プロフィール編集">
        <FormField label="表示名">
          <Flex gap={3} w="full">
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
        </FormField>
      </ProfileSection>
    );
  },
);
