import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { FaLayerGroup } from "react-icons/fa";
import { SectionTitle } from "@/components/dashboard/parts/SectionTitle";
import { cardStyle } from "@/styles/dashboardCardStyle";
import { MEAL_TIME_META } from "@/constants/mealTime";
import type { MealTime } from "@/types/meal";

type MealTimeDistributionItem = {
  mealTime: MealTime;
  count: number;
};

type MealTimeDistributionSectionProps = {
  distribution: MealTimeDistributionItem[];
  total: number;
};

export const MealTimeDistributionSection: FC<MealTimeDistributionSectionProps> =
  memo(({ distribution, total }) => (
    <Box {...cardStyle} p={{ base: 5, md: 6 }}>
      <SectionTitle icon={FaLayerGroup}>時間帯の割合</SectionTitle>
      <Stack gap={4}>
        {distribution.map(({ mealTime, count }) => {
          const meta = MEAL_TIME_META[mealTime];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <Box key={mealTime}>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {meta.label}
                </Text>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">
                  {count}件 ・ {pct}%
                </Text>
              </Flex>
              <Box
                w="full"
                h="8px"
                borderRadius="full"
                bg="gray.100"
                overflow="hidden"
              >
                <Box
                  h="full"
                  w={`${pct}%`}
                  minW={count > 0 ? "8px" : "0"}
                  borderRadius="full"
                  bg={`${meta.colorPalette}.400`}
                  transition="width 0.4s ease"
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  ));
