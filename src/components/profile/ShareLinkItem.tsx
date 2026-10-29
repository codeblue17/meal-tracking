import { memo } from "react";
import type { FC } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { FaRegCopy, FaShareAlt } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster-instance";
import type { MealShare } from "@/types/mealShare";
import { buildShareUrl } from "@/utils/shareUrl";
import { formatDisplayDate, fromDateStr } from "@/utils/dateUtils";

type ShareLinkItemProps = {
  share: MealShare;
  isRevoking: boolean;
  onRequestRevoke: (share: MealShare) => void;
};

// 見せる食事記録の範囲（食事をした日）
const formatPeriod = (startDate: string, endDate: string | null): string => {
  const start = formatDisplayDate(fromDateStr(startDate));
  return endDate
    ? `${start}〜${formatDisplayDate(fromDateStr(endDate))}の食事`
    : `${start}の食事から継続`;
};

const formatContents = (includeMemo: boolean, includeImages: boolean) =>
  ["食事名・時間帯", includeMemo && "メモ", includeImages && "写真"]
    .filter(Boolean)
    .join("・");

// 発行済みの共有リンク1件。URL のコピー・送信（Web Share API が使える環境のみ）と無効化の操作を持つ
export const ShareLinkItem: FC<ShareLinkItemProps> = memo(
  ({ share, isRevoking, onRequestRevoke }) => {
    const url = buildShareUrl(share.token);
    const canShare = typeof navigator.share === "function";

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(url);
        toaster.create({ title: "リンクをコピーしました", type: "success" });
      } catch {
        toaster.create({ title: "リンクのコピーに失敗しました", type: "error" });
      }
    };

    const handleShare = async () => {
      try {
        await navigator.share({ title: "食事記録の共有", url });
      } catch {
        // 共有シートを閉じた場合も reject されるため、何もしない
      }
    };

    return (
      <Box
        border="1px solid"
        borderColor="gray.100"
        borderRadius="xl"
        bg="gray.50"
        px={4}
        py={4}
      >
        <Stack gap={1} mb={3}>
          <Text color="gray.900" fontWeight="semibold">
            {share.label}
          </Text>
          <Text fontSize="sm" color="gray.600">
            見せる記録：{formatPeriod(share.start_date, share.end_date)}
          </Text>
          <Text fontSize="sm" color="gray.600">
            見せる内容：
            {formatContents(share.include_memo, share.include_images)}
          </Text>
          <Text fontSize="sm" color="gray.600">
            リンクを開ける期限：{formatDisplayDate(new Date(share.expires_at))}まで
          </Text>
        </Stack>
        <Flex gap={2} wrap="wrap">
          <Button
            size="sm"
            variant="outline"
            borderRadius="lg"
            colorPalette="teal"
            onClick={handleCopy}
          >
            <FaRegCopy />
            リンクをコピー
          </Button>
          {canShare && (
            <Button
              size="sm"
              variant="outline"
              borderRadius="lg"
              colorPalette="teal"
              onClick={handleShare}
            >
              <FaShareAlt />
              送る
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            borderRadius="lg"
            colorPalette="red"
            ml="auto"
            loading={isRevoking}
            onClick={() => onRequestRevoke(share)}
          >
            無効化
          </Button>
        </Flex>
      </Box>
    );
  },
);
