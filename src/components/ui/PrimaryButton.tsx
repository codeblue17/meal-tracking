import { Button } from "@chakra-ui/react";
import { memo } from "react";
import type { FC } from "react";
import type { ButtonProps } from "@chakra-ui/react";

export const PrimaryButton: FC<ButtonProps> = memo((props) => {
  return (
    <Button size="lg" borderRadius="xl" colorPalette="teal" {...props} />
  );
});
