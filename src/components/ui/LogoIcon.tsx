import { Flex } from "@chakra-ui/react";
import { memo } from "react";
import type { FC } from "react";
import type { FlexProps } from "@chakra-ui/react";

export const LogoIcon: FC<FlexProps> = memo((props) => {
  return (
    <Flex
      align="center"
      justify="center"
      borderRadius="full"
      fontWeight="bold"
      {...props}
    >
      食
    </Flex>
  );
});
