import { memo } from "react";
import type { FC } from "react";
import { Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { formatMonthLabel, shiftMonth, toMonthStr } from "@/utils/dateUtils";

type MonthFilterProps = {
  // 表示する月（YYYY-MM）。空文字は絞り込みなし（すべての月）
  value: string;
  onChange: (month: string) => void;
};

// 一覧を月で絞り込む。未指定時は「月で絞り込む」ボタンだけを出し、押すと今月から始まる。
// 指定中は「‹ 2026年11月 ›」で月を移動し、「今月」で今月へ、「クリア」で全件表示に戻る
export const MonthFilter: FC<MonthFilterProps> = memo(({ value, onChange }) => {
  const currentMonth = toMonthStr(new Date());

  if (!value) {
    return (
      <Flex>
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
          bg="white"
          borderRadius="full"
          color="gray.600"
          onClick={() => onChange(currentMonth)}
        >
          <FaCalendarAlt />
          月で絞り込む
        </Button>
      </Flex>
    );
  }

  return (
    <Flex align="center" gap={2} wrap="wrap">
      <Flex
        align="center"
        bg="white"
        border="1px solid"
        borderColor="teal.200"
        borderRadius="full"
        p={1}
      >
        <IconButton
          size="sm"
          variant="ghost"
          borderRadius="full"
          aria-label="前の月"
          color="gray.600"
          onClick={() => onChange(shiftMonth(value, -1))}
        >
          <FaChevronLeft size={11} />
        </IconButton>
        <Text
          minW="7.5em"
          textAlign="center"
          fontWeight="semibold"
          color="teal.700"
          fontSize="sm"
          aria-live="polite"
        >
          {formatMonthLabel(value)}
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          borderRadius="full"
          aria-label="次の月"
          color="gray.600"
          onClick={() => onChange(shiftMonth(value, 1))}
        >
          <FaChevronRight size={11} />
        </IconButton>
      </Flex>
      {value !== currentMonth && (
        <Button
          size="sm"
          variant="ghost"
          colorPalette="teal"
          borderRadius="full"
          onClick={() => onChange(currentMonth)}
        >
          今月
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        colorPalette="gray"
        borderRadius="full"
        onClick={() => onChange("")}
      >
        クリア
      </Button>
    </Flex>
  );
});
