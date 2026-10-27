import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { formatDisplayDate } from "@/utils/dateUtils";

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
        <InfoRow label="メールアドレス" value={email} />
        <InfoRow
          label="登録日"
          value={createdAt ? formatDisplayDate(new Date(createdAt)) : "—"}
        />
      </Stack>
    </Box>
  ),
);
