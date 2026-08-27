import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, SimpleGrid, Text, Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { FaCalendarCheck, FaFire, FaLayerGroup, FaUtensils } from "react-icons/fa";
import { cardStyle } from "@/styles/dashboardCardStyle";

const StatCard: FC<{
  icon: IconType;
  color: string;
  value: number;
  unit: string;
  label: string;
}> = memo(({ icon, color, value, unit, label }) => (
  <Box
    {...cardStyle}
    px={{ base: 4, md: 5 }}
    py={{ base: 4, md: 5 }}
    transition="transform 0.2s ease, box-shadow 0.2s ease"
    _hover={{
      transform: "translateY(-3px)",
      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.1)",
    }}
  >
    <Flex
      boxSize={10}
      borderRadius="xl"
      bg={`${color}.50`}
      color={`${color}.500`}
      align="center"
      justify="center"
      mb={3}
    >
      <Icon as={icon} boxSize={4} />
    </Flex>
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
));

type StatsSectionProps = {
  todayCount: number;
  streak: number;
  weekTotal: number;
  total: number;
};

export const StatsSection: FC<StatsSectionProps> = memo(
  ({ todayCount, streak, weekTotal, total }) => (
    <SimpleGrid
      columns={{ base: 2, md: 4 }}
      gap={{ base: 3, md: 5 }}
      mb={{ base: 5, md: 7 }}
    >
      <StatCard
        icon={FaUtensils}
        color="teal"
        value={todayCount}
        unit="件"
        label="今日の記録"
      />
      <StatCard
        icon={FaFire}
        color="orange"
        value={streak}
        unit="日"
        label="連続記録"
      />
      <StatCard
        icon={FaCalendarCheck}
        color="purple"
        value={weekTotal}
        unit="件"
        label="今週の記録"
      />
      <StatCard
        icon={FaLayerGroup}
        color="pink"
        value={total}
        unit="件"
        label="累計の記録"
      />
    </SimpleGrid>
  ),
);
