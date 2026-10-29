import { memo } from "react";
import type { FC } from "react";
import { Button, Stack } from "@chakra-ui/react";
import { ProfileSection } from "@/components/profile/ProfileSection";

type AccountActionsSectionProps = {
  onSignOut: () => void;
  onRequestDelete: () => void;
};

export const AccountActionsSection: FC<AccountActionsSectionProps> = memo(
  ({ onSignOut, onRequestDelete }) => (
    <ProfileSection title="アカウント操作">
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
    </ProfileSection>
  ),
);
