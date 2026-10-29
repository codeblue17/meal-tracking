import { memo, useState } from "react";
import type { FC } from "react";
import { Box, Button, Flex, Grid, IconButton, Text } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { WEEKDAY_LABELS } from "@/constants/date";

type CalendarPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export const CalendarPicker: FC<CalendarPickerProps> = memo(
  ({ value, onChange }) => {
    const [viewYear, setViewYear] = useState(value.getFullYear());
    const [viewMonth, setViewMonth] = useState(value.getMonth());

    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();

    const prevMonth = () => {
      if (viewMonth === 0) {
        setViewYear((y) => y - 1);
        setViewMonth(11);
      } else {
        setViewMonth((m) => m - 1);
      }
    };

    const nextMonth = () => {
      if (viewMonth === 11) {
        setViewYear((y) => y + 1);
        setViewMonth(0);
      } else {
        setViewMonth((m) => m + 1);
      }
    };

    return (
      <Box p={4} minW="280px">
        <Flex align="center" justify="space-between" mb={4}>
          <IconButton
            size="sm"
            variant="ghost"
            borderRadius="full"
            aria-label="前の月"
            onClick={prevMonth}
            color="gray.600"
            _hover={{ bg: "gray.100", color: "gray.700" }}
          >
            <FaChevronLeft size={11} />
          </IconButton>
          <Text fontWeight="semibold" color="gray.600" fontSize="sm">
            {viewYear}年{viewMonth + 1}月
          </Text>
          <IconButton
            size="sm"
            variant="ghost"
            borderRadius="full"
            aria-label="次の月"
            onClick={nextMonth}
            color="gray.600"
            _hover={{ bg: "gray.100", color: "gray.700" }}
          >
            <FaChevronRight size={11} />
          </IconButton>
        </Flex>

        <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
          {WEEKDAY_LABELS.map((d) => (
            <Text
              key={d}
              textAlign="center"
              fontSize="xs"
              color="gray.400"
              fontWeight="medium"
            >
              {d}
            </Text>
          ))}
        </Grid>

        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <Box key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isSelected =
              value.getFullYear() === viewYear &&
              value.getMonth() === viewMonth &&
              value.getDate() === day;
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === day;

            return (
              <Button
                key={day}
                size="xs"
                w="full"
                h="8"
                borderRadius="full"
                minW={0}
                px={0}
                bg={
                  isSelected ? "teal.500" : isToday ? "teal.50" : "transparent"
                }
                color={isSelected ? "white" : isToday ? "teal.600" : "gray.700"}
                fontWeight={isSelected || isToday ? "semibold" : "normal"}
                _hover={{
                  bg: isSelected ? "teal.600" : "teal.50",
                  color: isSelected ? "white" : "teal.700",
                }}
                onClick={() => onChange(new Date(viewYear, viewMonth, day))}
              >
                {day}
              </Button>
            );
          })}
        </Grid>
      </Box>
    );
  },
);
