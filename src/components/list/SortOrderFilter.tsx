import { memo } from "react";
import type { FC } from "react";
import { Button, Flex } from "@chakra-ui/react";
import type { SortOrder } from "@/utils/mealList";

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "新しい順" },
  { value: "asc", label: "古い順" },
];

type SortOrderFilterProps = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
};

// 一覧の日付の並び順（降順 = 新しい順 / 昇順 = 古い順）を切り替えるセグメントボタン
export const SortOrderFilter: FC<SortOrderFilterProps> = memo(
  ({ value, onChange }) => (
    <Flex
      role="group"
      aria-label="並び順"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="full"
      p={1}
      gap={1}
      flexShrink={0}
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            size="xs"
            px={3}
            borderRadius="full"
            variant={isActive ? "solid" : "ghost"}
            colorPalette={isActive ? "teal" : "gray"}
            fontWeight={isActive ? "semibold" : "medium"}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </Flex>
  ),
);
