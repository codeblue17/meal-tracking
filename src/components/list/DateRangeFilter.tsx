import { memo, useState } from "react";
import type { FC } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";

// 空の date input はブラウザ標準の「yyyy/mm/dd」が出て見栄えが悪いため、
// 未入力かつ非フォーカス時は日付テキストを透明にし、プレースホルダーを重ねて表示する
const DateFilterInput: FC<{
  value: string;
  placeholder: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}> = ({ value, placeholder, min, max, onChange }) => {
  const [focused, setFocused] = useState(false);
  const showPlaceholder = !value && !focused;
  return (
    <Box position="relative" w="170px" flexShrink={0}>
      <Input
        type="date"
        size="sm"
        bg="white"
        borderRadius="lg"
        borderColor="gray.200"
        color={showPlaceholder ? "transparent" : "gray.900"}
        cursor="pointer"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          // 年・月・日のテキスト部分をクリックしてもカレンダーが開くようにする
          try {
            e.currentTarget.showPicker();
          } catch {
            // showPicker 未対応ブラウザでは標準の挙動に任せる
          }
        }}
        _focus={{
          borderColor: "teal.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
        }}
      />
      {showPlaceholder && (
        <Text
          position="absolute"
          top="50%"
          left={3}
          transform="translateY(-50%)"
          fontSize="sm"
          color="gray.400"
          pointerEvents="none"
        >
          {placeholder}
        </Text>
      )}
    </Box>
  );
};

// 日付は YYYY-MM-DD 形式。未指定は空文字
export type DateRange = { from: string; to: string };

type DateRangeFilterProps = DateRange & {
  onChange: (range: DateRange) => void;
};

export const DateRangeFilter: FC<DateRangeFilterProps> = memo(
  ({ from, to, onChange }) => (
    <Flex align="center" gap={2} mb={6} wrap="wrap">
      <DateFilterInput
        value={from}
        placeholder="開始日"
        max={to || undefined}
        onChange={(value) => onChange({ from: value, to })}
      />
      <Text fontSize="sm" color="gray.500" flexShrink={0}>
        〜
      </Text>
      <DateFilterInput
        value={to}
        placeholder="終了日"
        min={from || undefined}
        onChange={(value) => onChange({ from, to: value })}
      />
      {(from || to) && (
        <Button
          size="sm"
          variant="ghost"
          colorPalette="gray"
          borderRadius="full"
          onClick={() => onChange({ from: "", to: "" })}
        >
          クリア
        </Button>
      )}
    </Flex>
  ),
);
