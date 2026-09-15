import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FaCalendarCheck } from "react-icons/fa";
import { SectionTitle } from "@/components/dashboard/parts/SectionTitle";
import { cardStyle } from "@/styles/dashboardCardStyle";

type WeeklyActivityDay = {
  key: string;
  weekday: string;
  count: number;
  isToday: boolean;
};

type WeeklyActivitySectionProps = {
  weekly: WeeklyActivityDay[];
  weeklyMax: number;
};

export const WeeklyActivitySection: FC<WeeklyActivitySectionProps> = memo(
  ({ weekly, weeklyMax }) => (
    <Box {...cardStyle} p={{ base: 5, md: 6 }}>
      <SectionTitle icon={FaCalendarCheck}>週間アクティビティ</SectionTitle>
      <Flex
        align="flex-end"
        justify="space-between"
        gap={{ base: 2, md: 3 }}
        h="160px"
      >
        {weekly.map((day) => {
          const ratio = day.count / weeklyMax;
          return (
            <Flex
              key={day.key}
              direction="column"
              align="center"
              justify="flex-end"
              flex={1}
              h="full"
              gap={2}
            >
              <Text
                fontSize="xs"
                fontWeight="bold"
                color={day.count > 0 ? "gray.700" : "gray.300"}
              >
                {day.count}
              </Text>
              <Box
                w="full"
                maxW="34px"
                h={`${Math.max(ratio * 100, day.count > 0 ? 14 : 4)}%`}
                minH="6px"
                borderRadius="lg"
                transition="height 0.3s ease"
                style={{
                  background: day.isToday
                    ? "linear-gradient(180deg, #2dd4bf, #0d9488)"
                    : day.count > 0
                      ? "linear-gradient(180deg, #99f6e4, #5eead4)"
                      : "#f1f5f9",
                }}
              />
              <Text
                fontSize="xs"
                fontWeight={day.isToday ? "bold" : "medium"}
                color={day.isToday ? "teal.600" : "gray.400"}
              >
                {day.weekday}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  ),
);
