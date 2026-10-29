import { memo } from "react";
import type { FC } from "react";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { formatDisplayDate } from "@/utils/dateUtils";
import { ProfileSection } from "@/components/profile/ProfileSection";

const InfoRow: FC<{ label: string; value: string | undefined }> = ({
  label,
  value,
}) => (
  <Flex justify="space-between" align="center">
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text fontSize="sm" color="gray.800" fontWeight="medium">
      {value}
    </Text>
  </Flex>
);

type AccountInfoSectionProps = {
  email: string | undefined;
  createdAt: string | undefined;
};

export const AccountInfoSection: FC<AccountInfoSectionProps> = memo(
  ({ email, createdAt }) => (
    <ProfileSection title="アカウント情報">
      <Stack gap={4}>
        <InfoRow label="メールアドレス" value={email} />
        <InfoRow
          label="登録日"
          value={createdAt ? formatDisplayDate(new Date(createdAt)) : "—"}
        />
      </Stack>
    </ProfileSection>
  ),
);
