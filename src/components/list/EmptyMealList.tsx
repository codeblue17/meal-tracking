import { memo } from "react";
import type { FC } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { FaUtensils } from "react-icons/fa";

type EmptyMealListProps = {
  // 時間帯・日付で絞り込んでいるか（メッセージの出し分けに使う）
  isFiltered: boolean;
};

export const EmptyMealList: FC<EmptyMealListProps> = memo(({ isFiltered }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    py={16}
    px={6}
    bg="white"
    borderRadius="2xl"
    border="1px solid"
    borderColor="gray.100"
    boxShadow="0 24px 70px rgba(15, 23, 42, 0.06)"
  >
    <Flex
      boxSize={14}
      borderRadius="full"
      bg="teal.50"
      color="teal.500"
      align="center"
      justify="center"
      mb={4}
    >
      <FaUtensils size={22} />
    </Flex>
    <Text color="gray.700" fontWeight="semibold" mb={1}>
      {isFiltered
        ? "条件に一致する記録はありません"
        : "まだ食事の記録がありません"}
    </Text>
    <Text fontSize="sm" color="gray.500">
      「食事を記録」から最初の記録を追加しましょう
    </Text>
  </Flex>
));
