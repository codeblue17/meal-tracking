import { Flex, Text } from "@chakra-ui/react";
import { memo } from "react";
import type { FC } from "react";
import type { FlexProps } from "@chakra-ui/react";

export const LogoIcon: FC<FlexProps> = memo((props) => {
  return (
    <Flex
      position="relative"
      align="center"
      justify="center"
      borderRadius="28%"
      overflow="hidden"
      fontWeight="bold"
      {...props}
    >
      <Flex
        position="absolute"
        inset={0}
        borderRadius="inherit"
        boxShadow="inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.15)"
        pointerEvents="none"
      />
      <Text
        as="span"
        position="relative"
        lineHeight="1"
        letterSpacing="-0.02em"
      >
        MT
      </Text>
    </Flex>
  );
});
