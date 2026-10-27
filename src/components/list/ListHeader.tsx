import { memo } from "react";
import type { FC } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

type ListHeaderProps = {
  totalCount: number;
};

export const ListHeader: FC<ListHeaderProps> = memo(({ totalCount }) => (
  <Box mb={6}>
    <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} color="gray.900">
      食事履歴一覧
    </Heading>
    <Text fontSize="sm" color="gray.500" mt={1}>
      {totalCount} 件の記録
    </Text>
  </Box>
));
