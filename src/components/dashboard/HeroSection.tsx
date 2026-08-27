import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const timeBasedGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 11) return "おはようございます";
  if (h < 18) return "こんにちは";
  return "こんばんは";
};

const displayName = (
  email: string | undefined,
  fullName: string | undefined,
): string => fullName?.trim() || email?.split("@")[0] || "ゲスト";

const todayLabel = (): string =>
  new Date().toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

type HeroSectionProps = {
  userEmail: string | undefined;
  userFullName: string | undefined;
  todayCount: number;
  onAddMeal: () => void;
};

export const HeroSection: FC<HeroSectionProps> = memo(
  ({ userEmail, userFullName, todayCount, onAddMeal }) => (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="3xl"
      px={{ base: 6, md: 10 }}
      py={{ base: 8, md: 10 }}
      mb={{ base: 5, md: 7 }}
      color="white"
      style={{
        background:
          "linear-gradient(135deg, #0f766e 0%, #0d9488 45%, #14b8a6 100%)",
      }}
      boxShadow="0 24px 70px rgba(13, 148, 136, 0.35)"
    >
      {/* 装飾の光の円 */}
      <Box
        position="absolute"
        top="-80px"
        right="-40px"
        boxSize="240px"
        borderRadius="full"
        bg="whiteAlpha.200"
        filter="blur(8px)"
      />
      <Box
        position="absolute"
        bottom="-110px"
        right="120px"
        boxSize="200px"
        borderRadius="full"
        bg="whiteAlpha.100"
      />

      <Flex
        position="relative"
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={6}
      >
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.800">
            {todayLabel()}
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl" }}
            mt={2}
            lineHeight="1.25"
            fontWeight="bold"
          >
            {timeBasedGreeting()}、
            <br />
            {displayName(userEmail, userFullName)}
            さん
          </Heading>
          <Text mt={3} fontSize="sm" color="whiteAlpha.900" maxW="380px">
            {todayCount > 0 ? (
              <>
                今日はすでに {todayCount} 件記録しています。
                <br />
                この調子で続けましょう。
              </>
            ) : (
              <>
                今日の食事をまだ記録していません。
                <br />
                最初の一品を記録しましょう。
              </>
            )}
          </Text>
        </Box>

        <PrimaryButton
          size="lg"
          bg="white"
          color="teal.700"
          flexShrink={0}
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.18)"
          onClick={onAddMeal}
          _hover={{ bg: "whiteAlpha.900", transform: "translateY(-2px)" }}
          _active={{ bg: "white" }}
          transition="transform 0.2s ease"
        >
          <Icon as={FaPlus} mr={2} boxSize={3.5} />
          食事を記録する
        </PrimaryButton>
      </Flex>
    </Box>
  ),
);
