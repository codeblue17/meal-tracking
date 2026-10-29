import type { FC, ReactNode } from "react";
import { Box, Text } from "@chakra-ui/react";

type ProfileSectionProps = {
  title: string;
  titleSize?: "xl" | "sm";
  children: ReactNode;
};

// プロフィールカード内の1セクション（タイトル＋下境界線）。
// カードの最後のセクションは境界線を出さない
export const ProfileSection: FC<ProfileSectionProps> = ({
  title,
  titleSize = "xl",
  children,
}) => (
  <Box
    px={{ base: 6, md: 12 }}
    py={8}
    borderBottom="1px solid"
    borderColor="gray.100"
    _last={{ borderBottom: "none" }}
  >
    <Text color="teal.600" fontWeight="semibold" fontSize={titleSize} mb={5}>
      {title}
    </Text>
    {children}
  </Box>
);
