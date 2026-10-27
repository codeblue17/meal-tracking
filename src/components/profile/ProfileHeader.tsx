import { memo } from "react";
import type { FC } from "react";
import { Flex, Heading, Text } from "@chakra-ui/react";

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
        {getInitial(fullName, email)}
      </Flex>
      <Heading as="h2" fontSize="xl" color="gray.900" mb={1}>
        {fullName || "未設定"}
      </Heading>
      <Text fontSize="sm" color="gray.500">
        {email}
      </Text>
    </Flex>
  ),
);
