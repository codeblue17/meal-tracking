import { memo } from "react";
import type { FC } from "react";
import { Button, HStack } from "@chakra-ui/react";
import type { MealTime } from "@/types/meal";
import { MEAL_TIME_META, MEAL_TIME_ORDER } from "@/constants/mealTime";

export type MealTimeFilterValue = MealTime | "all";

const FILTERS: { value: MealTimeFilterValue; label: string }[] = [
  { value: "all", label: "すべて" },
  ...MEAL_TIME_ORDER.map((mt) => ({
    value: mt,
    label: MEAL_TIME_META[mt].label,
  })),
];

type MealTimeFilterProps = {
  value: MealTimeFilterValue;
  onChange: (value: MealTimeFilterValue) => void;
};

export const MealTimeFilter: FC<MealTimeFilterProps> = memo(
  ({ value, onChange }) => (
    <HStack gap={2} mb={6} overflowX="auto" pb={1}>
      {FILTERS.map((item) => {
        const isActive = value === item.value;
        return (
          <Button
            key={item.value}
            size="sm"
            borderRadius="full"
            variant={isActive ? "solid" : "outline"}
            colorPalette={isActive ? "teal" : "gray"}
            onClick={() => onChange(item.value)}
            fontWeight={isActive ? "semibold" : "medium"}
            flexShrink={0}
          >
            {item.label}
          </Button>
        );
      })}
    </HStack>
  ),
);
