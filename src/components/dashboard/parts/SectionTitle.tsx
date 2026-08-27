import { memo } from "react";
import type { FC } from "react";
import { Heading, HStack, Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";

export const SectionTitle: FC<{ icon: IconType; children: string }> = memo(
  ({ icon, children }) => (
    <HStack gap={2.5} mb={5}>
      <Icon as={icon} color="teal.500" boxSize={4} />
      <Heading as="h3" fontSize="md" color="gray.900">
        {children}
      </Heading>
    </HStack>
  ),
);
