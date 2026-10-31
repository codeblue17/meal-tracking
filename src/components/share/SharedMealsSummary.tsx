import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { cardStyle } from "@/styles/dashboardCardStyle";
import { MealTimeDistributionSection } from "@/components/dashboard/MealTimeDistributionSection";
import type { MealTime } from "@/types/meal";

type SharedMealsSummaryProps = {
  total: number;
  recordedDays: number;
  distribution: { mealTime: MealTime; count: number }[];
};

const SummaryTile: FC<{ value: number; unit: string; label: string }> = ({
  value,
  unit,
  label,
}) => (
  <Box {...cardStyle} px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }}>
    <Flex align="baseline" gap={1}>
      <Text
        fontSize={{ base: "2xl", md: "3xl" }}
        fontWeight="bold"
        color="gray.900"
        lineHeight="1"
      >
        {value}
      </Text>
      <Text fontSize="sm" color="gray.400" fontWeight="medium">
        {unit}
      </Text>
    </Flex>
    <Text fontSize="xs" color="gray.500" mt={1.5} fontWeight="medium">
      {label}
    </Text>
  </Box>
);

// 共有範囲の記録の概要（件数・記録した日数・時間帯の割合）
export const SharedMealsSummary: FC<SharedMealsSummaryProps> = memo(
  ({ total, recordedDays, distribution }) => (
    <Box mb={{ base: 5, md: 7 }}>
      <SimpleGrid columns={2} gap={{ base: 3, md: 5 }} mb={{ base: 3, md: 5 }}>
        <SummaryTile value={total} unit="件" label="食事の記録" />
        <SummaryTile value={recordedDays} unit="日" label="記録した日数" />
      </SimpleGrid>
      <MealTimeDistributionSection distribution={distribution} total={total} />
    </Box>
  ),
);
