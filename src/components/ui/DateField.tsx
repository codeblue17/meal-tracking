import { memo, useState } from "react";
import type { FC } from "react";
import { Box, Button, Popover, Text } from "@chakra-ui/react";
import { FaCalendarAlt } from "react-icons/fa";
import { CalendarPicker } from "@/components/ui/CalendarPicker";
import { formatDisplayDate } from "@/utils/dateUtils";

type DateFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
};

// 選択中の日付を表示するボタン。クリックでカレンダーを開き、日付を選ぶと閉じる
export const DateField: FC<DateFieldProps> = memo(({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: "bottom-start" }}
    >
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          w="full"
          h="12"
          justifyContent="space-between"
          px={4}
          borderRadius="xl"
          bg="gray.50"
          borderColor={open ? "teal.500" : "gray.200"}
          color="gray.800"
          fontWeight="normal"
          fontSize="md"
          boxShadow={open ? "0 0 0 1px var(--chakra-colors-teal-500)" : "none"}
          _hover={{ bg: "gray.50", borderColor: "teal.400" }}
        >
          <Text>{formatDisplayDate(value)}</Text>
          <Box color={open ? "teal.500" : "gray.400"}>
            <FaCalendarAlt size={15} />
          </Box>
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          p={0}
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="0 8px 24px rgba(15, 23, 42, 0.12)"
          w="auto"
        >
          <Popover.Body p={0}>
            <CalendarPicker
              value={value}
              onChange={(date) => {
                onChange(date);
                setOpen(false);
              }}
            />
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
});
