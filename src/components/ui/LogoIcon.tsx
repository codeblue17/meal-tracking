import { Flex } from "@chakra-ui/react";
import { memo } from "react";
import type { FC } from "react";
import type { FlexProps } from "@chakra-ui/react";

// アプリのロゴ「器と若葉」。器（食事）から若葉（健康）が芽吹く形。
// マークは currentColor で塗るので、呼び出し側の color で色を、boxSize で大きさを決める。
// public/favicon.svg も同じマークなので、形を変えるときは両方を直す
export const LogoIcon: FC<FlexProps> = memo((props) => {
  return (
    <Flex
      position="relative"
      align="center"
      justify="center"
      borderRadius="28%"
      overflow="hidden"
      flexShrink={0}
      {...props}
    >
      <Flex
        position="absolute"
        inset={0}
        borderRadius="inherit"
        boxShadow="inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -3px 6px rgba(0, 0, 0, 0.15)"
        pointerEvents="none"
      />
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        width="58%"
        height="58%"
        aria-hidden="true"
        style={{ position: "relative" }}
      >
        <path d="M2.5 12.5h19a9.5 9.5 0 0 1-19 0z" />
        <path d="M12 11.2c-.2-4.3 2.3-7.4 7-8.2.4 4.6-2.2 7.9-7 8.2z" />
        <path
          d="M11.4 11.2c-3.2-.1-5-2-5.3-5.1 3.1.1 5 2 5.3 5.1z"
          opacity={0.75}
        />
      </svg>
    </Flex>
  );
});
