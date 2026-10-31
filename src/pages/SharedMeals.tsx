import { memo, useMemo, useState } from "react";
import type { FC } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useSharedMeals } from "@/hooks/useSharedMeals";
import { countByMealTime } from "@/hooks/useDashboardStats";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Pagination } from "@/components/ui/Pagination";
import { MealGroupList } from "@/components/list/MealGroupList";
import { SharedMealsHeader } from "@/components/share/SharedMealsHeader";
import { SharedMealsSummary } from "@/components/share/SharedMealsSummary";
import { SharedMealsNotice } from "@/components/share/SharedMealsNotice";
import { groupByDate, sortMealsForList } from "@/utils/mealList";

const PAGE_SIZE = 10;

// ログイン不要・読み取り専用の共有ページ（/share/:token）。
// 栄養士など、アプリの利用者ではない人が開く
export const SharedMeals: FC = memo(() => {
  const { token } = useParams();
  const { result, loading, error } = useSharedMeals(token);
  const [page, setPage] = useState(1);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const shared = result?.status === "ok" ? result : null;

  const sortedMeals = useMemo(
    () => (shared ? sortMealsForList(shared.meals) : []),
    [shared],
  );
  const summary = useMemo(
    () => ({
      recordedDays: new Set(sortedMeals.map((m) => m.eaten_at)).size,
      distribution: countByMealTime(sortedMeals),
    }),
    [sortedMeals],
  );

  const totalPages = Math.max(1, Math.ceil(sortedMeals.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedGroups = useMemo(
    () =>
      groupByDate(
        sortedMeals.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
      ),
    [sortedMeals, currentPage],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Flex justify="center" py={20}>
          <Spinner size="lg" color="teal.500" borderWidth="3px" />
        </Flex>
      );
    }
    if (error) {
      return (
        <SharedMealsNotice
          title="読み込みに失敗しました"
          description="通信状況を確認して、ページを再読み込みしてください。"
        />
      );
    }
    if (result?.status === "expired") {
      return (
        <SharedMealsNotice
          title="このリンクは有効期限が切れています"
          description="期限が過ぎたか、共有した方がリンクを無効化しました。引き続き閲覧するには、新しいリンクを発行してもらってください。"
        />
      );
    }
    if (!shared) {
      return (
        <SharedMealsNotice
          title="リンクが無効です"
          description="URL が正しいか、共有した方に確認してください。"
        />
      );
    }
    return (
      <>
        <SharedMealsHeader
          ownerName={shared.owner_name}
          label={shared.label}
          goalType={shared.goal_type}
          goalDetail={shared.goal_detail}
          startDate={shared.start_date}
          endDate={shared.end_date}
          expiresAt={shared.expires_at}
          includeMemo={shared.include_memo}
          includeImages={shared.include_images}
        />
        <SharedMealsSummary
          total={sortedMeals.length}
          recordedDays={summary.recordedDays}
          distribution={summary.distribution}
        />
        {sortedMeals.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={10}>
            この範囲の食事記録はまだありません
          </Text>
        ) : (
          <>
            <MealGroupList
              groups={pagedGroups}
              onPreviewImage={setPreviewImageUrl}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </>
    );
  };

  return (
    <Box
      bg="gray.50"
      minH="100svh"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
    >
      {/* トークン入りの URL を検索エンジンに載せない（React 19 が head に移す） */}
      <meta name="robots" content="noindex, nofollow" />
      <title>共有された食事記録 | Meal Tracking</title>

      <Box maxW="720px" mx="auto">
        <Flex align="center" gap={2.5} mb={{ base: 5, md: 7 }}>
          <LogoIcon boxSize={8} bg="teal.600" color="white" />
          <Text color="teal.700" fontWeight="semibold">
            Meal Tracking
          </Text>
        </Flex>
        {renderContent()}
      </Box>

      <ImageLightbox
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </Box>
  );
});
