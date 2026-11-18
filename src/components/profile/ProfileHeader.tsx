import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

// アバターに表示する1文字（表示名 → メール → "?" の順で採用）
const getInitial = (
  fullName: string | undefined,
  email: string | undefined,
): string => (fullName?.charAt(0) || email?.charAt(0) || "?").toUpperCase();

type ProfileHeaderProps = {
  fullName: string | undefined;
  email: string | undefined;
};

export const ProfileHeader: FC<ProfileHeaderProps> = memo(
  ({ fullName, email }) => (
    <Flex
      align="center"
      gap={4}
      py={{ base: 6, md: 8 }}
      px={{ base: 6, md: 12 }}
      bg="teal.50"
    >
      <Flex
        boxSize={{ base: 14, md: 16 }}
        flexShrink={0}
        borderRadius="full"
        bg="teal.500"
        color="white"
        align="center"
        justify="center"
        fontSize="xl"
        fontWeight="bold"
        boxShadow="0 8px 24px rgba(20, 184, 166, 0.28)"
      >
        {getInitial(fullName, email)}
      </Flex>
      <Box minW={0}>
        <Heading as="h2" fontSize="xl" color="gray.900" mb={1} truncate>
          {fullName || "未設定"}
        </Heading>
        <Text fontSize="sm" color="gray.500" truncate>
          {email}
        </Text>
      </Box>
    </Flex>
  ),
);
