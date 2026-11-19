import { memo, useCallback, useMemo, useState } from "react";
import type { FC } from "react";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useSharedMeals } from "@/hooks/useSharedMeals";
import { countByMealTime } from "@/hooks/useDashboardStats";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Pagination } from "@/components/ui/Pagination";
import { MealGroupList } from "@/components/list/MealGroupList";
import { MonthFilter } from "@/components/list/MonthFilter";
import { SortOrderFilter } from "@/components/list/SortOrderFilter";
import { SharedMealsHeader } from "@/components/share/SharedMealsHeader";
import { SharedMealsSummary } from "@/components/share/SharedMealsSummary";
import { SharedMealsNotice } from "@/components/share/SharedMealsNotice";
import { groupByDate, sortMealsForList } from "@/utils/mealList";
import type { SortOrder } from "@/utils/mealList";

const PAGE_SIZE = 10;

// ログイン不要・読み取り専用の共有ページ（/share/:token）。
// 栄養士など、アプリの利用者ではない人が開く
export const SharedMeals: FC = memo(() => {
  const { token } = useParams();
  const { result, loading, error } = useSharedMeals(token);
  const [page, setPage] = useState(1);
  // 表示する月（YYYY-MM、空文字はすべて）と日付の並び順。一覧画面と同じ操作
  const [month, setMonth] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const shared = result?.status === "ok" ? result : null;

  const allMeals = useMemo(() => shared?.meals ?? [], [shared]);

  // サマリーは月の絞り込みに関係なく、共有されている範囲全体で数える
  const summary = useMemo(
    () => ({
      recordedDays: new Set(allMeals.map((m) => m.eaten_at)).size,
      distribution: countByMealTime(allMeals),
    }),
    [allMeals],
  );

  // eaten_at は YYYY-MM-DD 形式のため、表示月（YYYY-MM）との前方一致で絞り込める
  const visibleMeals = useMemo(
    () =>
      sortMealsForList(
        month
          ? allMeals.filter((m) => m.eaten_at.startsWith(`${month}-`))
          : allMeals,
        sortOrder,
      ),
    [allMeals, month, sortOrder],
  );

  // 絞り込み・並び順が変わったら1ページ目に戻す
  const handleMonthChange = useCallback((value: string) => {
    setMonth(value);
    setPage(1);
  }, []);

  const handleSortOrderChange = useCallback((value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(visibleMeals.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedGroups = useMemo(
    () =>
      groupByDate(
        visibleMeals.slice(
          (currentPage - 1) * PAGE_SIZE,
          currentPage * PAGE_SIZE,
        ),
        sortOrder,
      ),
    [visibleMeals, currentPage, sortOrder],
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
          total={allMeals.length}
          recordedDays={summary.recordedDays}
          distribution={summary.distribution}
        />
        {allMeals.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={10}>
            この範囲の食事記録はまだありません
          </Text>
        ) : (
          <>
            {/* 表示月フィルタ・並び順 */}
            <Flex
              align="center"
              justify="space-between"
              gap={3}
              mb={6}
              wrap="wrap"
            >
              <MonthFilter value={month} onChange={handleMonthChange} />
              <SortOrderFilter
                value={sortOrder}
                onChange={handleSortOrderChange}
              />
            </Flex>
            {visibleMeals.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={10}>
                この月の食事記録はありません
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
