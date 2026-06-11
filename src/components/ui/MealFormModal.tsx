import React, { memo, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Input,
  Popover,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import type { MealTime } from "@/types/meal";
import { inputStyle } from "@/styles/formStyles";
import { toDateStr, formatDisplayDate } from "@/utils/dateUtils";

type Props = {
  open: boolean;
  onClose: () => void;
};

const MEAL_TIMES: { value: MealTime; label: string }[] = [
  { value: "breakfast", label: "朝食" },
  { value: "lunch", label: "昼食" },
  { value: "dinner", label: "夕食" },
  { value: "snack", label: "間食" },
];

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

type CalendarPickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

const CalendarPicker: FC<CalendarPickerProps> = ({ value, onChange }) => {
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
          color="gray.300"
          _hover={{ bg: "gray.100", color: "gray.700" }}
        >
          <FaChevronLeft size={11} />
        </IconButton>
        <Text fontWeight="semibold" color="gray.300" fontSize="sm">
          {viewYear}年{viewMonth + 1}月
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          borderRadius="full"
          aria-label="次の月"
          onClick={nextMonth}
          color="gray.300"
          _hover={{ bg: "gray.100", color: "gray.700" }}
        >
          <FaChevronRight size={11} />
        </IconButton>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
        {DAYS_OF_WEEK.map((d) => (
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
              bg={isSelected ? "teal.500" : isToday ? "teal.50" : "transparent"}
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
};

// フォーム状態を持つ内部コンポーネント。open=false でアンマウントされ、状態が自動リセットされる
const MealFormContent: FC<{ onClose: () => void }> = memo(({ onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [mealTime, setMealTime] = useState<MealTime>("breakfast");
  const [eatenDate, setEatenDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        name: name.trim(),
        meal_time: mealTime,
        eaten_at: toDateStr(eatenDate),
        memo: memo.trim() || null,
      });
      if (error) throw error;
      toaster.create({ title: "食事を記録しました", type: "success" });
      onClose();
    } catch {
      toaster.create({ title: "記録に失敗しました", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog.Body py={6}>
        <Stack as="form" id="meal-form" onSubmit={handleSubmit} gap={5}>
          <Box>
            <Text color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
              食事名{" "}
            </Text>
            <Input
              placeholder="例: 鶏むね肉の定食"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              {...inputStyle}
            />
          </Box>

          <Box>
            <Text color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
              時間帯
            </Text>
            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
              {MEAL_TIMES.map((item) => {
                const isSelected = mealTime === item.value;
                return (
                  <Button
                    key={item.value}
                    size="md"
                    borderRadius="xl"
                    variant={isSelected ? "solid" : "outline"}
                    colorPalette={isSelected ? "teal" : "gray"}
                    onClick={() => setMealTime(item.value)}
                    type="button"
                    fontWeight={isSelected ? "semibold" : "medium"}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Grid>
          </Box>

          <Box>
            <Text color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
              日付
            </Text>
            <Popover.Root
              open={isCalendarOpen}
              onOpenChange={(e) => setIsCalendarOpen(e.open)}
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
                  borderColor={isCalendarOpen ? "teal.500" : "gray.200"}
                  color="gray.800"
                  fontWeight="normal"
                  fontSize="md"
                  boxShadow={
                    isCalendarOpen
                      ? "0 0 0 1px var(--chakra-colors-teal-500)"
                      : "none"
                  }
                  _hover={{ bg: "gray.50", borderColor: "teal.400" }}
                >
                  <Text>{formatDisplayDate(eatenDate)}</Text>
                  <Box color={isCalendarOpen ? "teal.500" : "gray.400"}>
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
                      value={eatenDate}
                      onChange={(date) => {
                        setEatenDate(date);
                        setIsCalendarOpen(false);
                      }}
                    />
                  </Popover.Body>
                </Popover.Content>
              </Popover.Positioner>
            </Popover.Root>
          </Box>

          <Box>
            <Text color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
              メモ
            </Text>
            <Textarea
              placeholder="食材・気づきなど（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              size="lg"
              borderRadius="xl"
              bg="gray.50"
              borderColor="gray.200"
              minH="100px"
              resize="none"
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
              }}
            />
          </Box>
        </Stack>
      </Dialog.Body>

      <Dialog.Footer borderTop="1px solid" borderColor="gray.100" pt={4}>
        <Flex gap={3} w="full">
          <Button
            flex={1}
            size="lg"
            borderRadius="xl"
            variant="outline"
            color="gray.500"
            borderColor="gray.200"
            onClick={onClose}
            _hover={{ bg: "gray.50" }}
          >
            キャンセル
          </Button>
          <Button
            flex={2}
            size="lg"
            borderRadius="xl"
            colorPalette="teal"
            type="submit"
            form="meal-form"
            loading={loading}
            boxShadow="0 12px 24px rgba(20, 184, 166, 0.22)"
          >
            記録する
          </Button>
        </Flex>
      </Dialog.Footer>
    </>
  );
});

export const MealFormModal: FC<Props> = memo(({ open, onClose }) => {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop bg="blackAlpha.400" />
      <Dialog.Positioner>
        <Dialog.Content
          borderRadius="2xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.16)"
          border="1px solid"
          borderColor="gray.100"
          maxW="480px"
          w="full"
          mx={4}
        >
          <Dialog.Header borderBottom="1px solid" borderColor="gray.100" pb={4}>
            <Dialog.Title color="gray.900" fontSize="lg">
              食事を記録
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" borderRadius="full" />
          </Dialog.CloseTrigger>
          {open && <MealFormContent onClose={onClose} />}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
});
