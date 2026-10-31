import { memo } from "react";
import type { FC } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { cardStyle } from "@/styles/dashboardCardStyle";

type SharedMealsNoticeProps = {
  title: string;
  description: string;
};

// 共有ページで記録を表示できないとき（リンクが無効・期限切れ・読み込み失敗）のお知らせ
export const SharedMealsNotice: FC<SharedMealsNoticeProps> = memo(
  ({ title, description }) => (
    <Box {...cardStyle} px={{ base: 6, md: 10 }} py={{ base: 10, md: 14 }} textAlign="center">
      <Heading as="h1" fontSize={{ base: "lg", md: "xl" }} color="gray.900" mb={3}>
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.600" lineHeight="1.8">
        {description}
      </Text>
    </Box>
  ),
);
