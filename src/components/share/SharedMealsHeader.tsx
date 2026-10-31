import { memo } from "react";
import type { FC } from "react";
import { Badge, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { cardStyle } from "@/styles/dashboardCardStyle";
import { GOAL_TYPES } from "@/constants/goal";
import type { GoalType } from "@/constants/goal";
import {
  formatShareContents,
  formatShareExpiry,
  formatSharePeriod,
} from "@/utils/shareFormat";

type SharedMealsHeaderProps = {
  ownerName: string | null;
  label: string;
  goalType: GoalType | null;
  goalDetail: string | null;
  startDate: string;
  endDate: string | null;
  expiresAt: string;
  includeMemo: boolean;
  includeImages: boolean;
};

const formatGoal = (
  goalType: GoalType | null,
  goalDetail: string | null,
): string | null => {
  const typeLabel = GOAL_TYPES.find((goal) => goal.value === goalType)?.label;
  const detail = goalDetail?.trim();
  if (typeLabel && detail) return `${typeLabel}（${detail}）`;
  return typeLabel ?? detail ?? null;
};

// 共有ページの見出し。だれの記録か・目標・見せる範囲・リンクの期限を示す
export const SharedMealsHeader: FC<SharedMealsHeaderProps> = memo(
  ({
    ownerName,
    label,
    goalType,
    goalDetail,
    startDate,
    endDate,
    expiresAt,
    includeMemo,
    includeImages,
  }) => {
    const goal = formatGoal(goalType, goalDetail);
    return (
      <Box {...cardStyle} p={{ base: 5, md: 7 }} mb={{ base: 5, md: 7 }}>
        <Flex align="center" gap={3} wrap="wrap">
          <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} color="gray.900">
            {ownerName ? `${ownerName}さんの食事記録` : "共有された食事記録"}
          </Heading>
          <Badge colorPalette="gray" variant="subtle" borderRadius="full" px={2.5}>
            閲覧専用
          </Badge>
        </Flex>
        <Box mb={5} />
        <Stack gap={1.5} fontSize="sm" color="gray.700">
          <Text>共有先：{label}</Text>
          {goal && <Text>目標：{goal}</Text>}
          <Text>見せる記録：{formatSharePeriod(startDate, endDate)}</Text>
          <Text>見せる内容：{formatShareContents(includeMemo, includeImages)}</Text>
          <Text color="gray.500">
            リンクを開ける期限：{formatShareExpiry(expiresAt)}
          </Text>
        </Stack>
      </Box>
    );
  },
);
