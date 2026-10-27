import { memo } from "react";
import type { FC } from "react";
import { Box, Button, Stack, Text } from "@chakra-ui/react";

type AccountActionsSectionProps = {
  onSignOut: () => void;
  onRequestDelete: () => void;
};

export const AccountActionsSection: FC<AccountActionsSectionProps> = memo(
  ({ onSignOut, onRequestDelete }) => (
    <Box px={{ base: 6, md: 12 }} py={8}>
      <Text color="teal.600" fontWeight="semibold" fontSize="sm" mb={5}>
        アカウント操作
      </Text>
      <Stack gap={3}>
        <Button
          size="lg"
          borderRadius="xl"
          variant="outline"
          color="red.500"
          borderColor="red.200"
          w="full"
          onClick={onSignOut}
          _hover={{
            bg: "red.50",
            borderColor: "red.300",
            color: "red.600",
          }}
        >
          サインアウト
        </Button>
        <Button
          size="lg"
          borderRadius="xl"
          variant="ghost"
          color="gray.400"
          w="full"
          onClick={onRequestDelete}
          _hover={{ bg: "red.50", color: "red.600" }}
        >
          退会する
        </Button>
      </Stack>
    </Box>
  ),
);
