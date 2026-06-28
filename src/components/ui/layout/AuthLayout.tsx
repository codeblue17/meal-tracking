import { memo } from "react";
import type { FC, ReactNode } from "react";
import React from "react";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { LogoIcon } from "../LogoIcon";

type AuthLayoutProps = {
  /** 左パネルの見出し（<br /> などの要素も渡せる） */
  leadHeading: ReactNode;
  /** 左パネルの説明文 */
  leadDescription: string;
  /** フォーム側の見出し */
  title: string;
  /** フォーム側の説明文 */
  description: string;
  onSubmit: (e: React.BaseSyntheticEvent) => void;
  /** 入力フィールド・送信ボタン・切替リンクなどフォーム本体 */
  children: ReactNode;
};

export const AuthLayout: FC<AuthLayoutProps> = memo(
  ({ leadHeading, leadDescription, title, description, onSubmit, children }) => {
    return (
      <Flex
        minH="100svh"
        align="center"
        justify="center"
        bg="gray.50"
        px={{ base: 4, md: 8 }}
        py={{ base: 8, md: 12 }}
      >
        <Flex
          w="full"
          maxW="980px"
          minH={{ base: "auto", md: "620px" }}
          bg="white"
          borderRadius={{ base: "2xl", md: "3xl" }}
          overflow="hidden"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.12)"
          border="1px solid"
          borderColor="gray.100"
        >
          <Flex
            flex="1"
            display={{ base: "none", md: "flex" }}
            direction="column"
            justify="space-between"
            bg="teal.600"
            color="white"
            p={10}
            textAlign="left"
          >
            <Box>
              <LogoIcon boxSize={12} bg="whiteAlpha.300" fontSize="xl" mb={8} />
              <Heading
                as="h1"
                color="white"
                fontSize="4xl"
                lineHeight="1.15"
                mb={4}
              >
                {leadHeading}
              </Heading>
              <Text color="teal.50" fontSize="md" lineHeight="1.8">
                {leadDescription}
              </Text>
            </Box>
            <Box
              borderTop="1px solid"
              borderColor="whiteAlpha.300"
              pt={6}
              color="teal.50"
              fontSize="sm"
              lineHeight="1.8"
            >
              記録を続けるほど、自分に合う食生活が見えてきます。
            </Box>
          </Flex>

          <Flex
            as="form"
            onSubmit={onSubmit}
            flex="1"
            direction="column"
            justify="center"
            px={{ base: 6, md: 12 }}
            py={{ base: 10, md: 12 }}
            textAlign="left"
          >
            <Box mb={8}>
              <Text color="teal.600" fontWeight="semibold" fontSize="sm" mb={3}>
                Meal Tracking
              </Text>
              <Heading
                as="h2"
                color="gray.900"
                fontSize={{ base: "2xl", md: "3xl" }}
                mb={3}
              >
                {title}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {description}
              </Text>
            </Box>

            <Stack gap={4}>{children}</Stack>
          </Flex>
        </Flex>
      </Flex>
    );
  }
);
