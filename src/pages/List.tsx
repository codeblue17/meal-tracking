import { memo, useCallback, useMemo, useState } from "react";
import type { FC } from "react";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useMeals } from "@/hooks/useMeals";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { MealFormModal } from "@/components/ui/MealFormModal";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { Pagination } from "@/components/ui/Pagination";
import { ListHeader } from "@/components/list/ListHeader";
import { MealTimeFilter } from "@/components/list/MealTimeFilter";
import type { MealTimeFilterValue } from "@/components/list/MealTimeFilter";
// 日付範囲フィルタは表示月フィルタに置き換えた。再採用に備えてコメントアウトで残す
// import { DateRangeFilter } from "@/components/list/DateRangeFilter";
// import type { DateRange } from "@/components/list/DateRangeFilter";
import { MonthFilter } from "@/components/list/MonthFilter";
import { SortOrderFilter } from "@/components/list/SortOrderFilter";
import { EmptyMealList } from "@/components/list/EmptyMealList";
import { MealGroupList } from "@/components/list/MealGroupList";
import type { Meal } from "@/types/meal";
import { deleteMealImage } from "@/utils/imageUpload";
import { groupByDate, sortMealsForList } from "@/utils/mealList";
import type { SortOrder } from "@/utils/mealList";

const PAGE_SIZE = 10;

export const List: FC = memo(() => {
  const { meals, setMeals, loading } = useMeals();
  const [mealTimeFilter, setMealTimeFilter] =
    useState<MealTimeFilterValue>("all");
  // 表示する月（YYYY-MM）。空文字は絞り込みなし（初期表示はすべて）
  const [month, setMonth] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  // 日付範囲フィルタ（コメントアウト中）
  // const [dateFrom, setDateFrom] = useState("");
  // const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 絞り込み条件が変わったら1ページ目に戻す
  const handleMealTimeFilterChange = useCallback(
    (value: MealTimeFilterValue) => {
      setMealTimeFilter(value);
      setPage(1);
    },
    [],
  );

  const handleMonthChange = useCallback((value: string) => {
    setMonth(value);
    setPage(1);
  }, []);

  const handleSortOrderChange = useCallback((value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  }, []);

  // 日付範囲フィルタ（コメントアウト中）
  // const handleDateRangeChange = useCallback(({ from, to }: DateRange) => {
  //   setDateFrom(from);
  //   setDateTo(to);
  //   setPage(1);
  // }, []);

  const openEditModal = useCallback(
    (mealId: string) => {
      const meal = meals.find((m) => m.id === mealId);
      if (!meal) return;
      setEditingMeal(meal);
      setIsMealModalOpen(true);
    },
    [meals],
  );

  const handleDelete = useCallback(
    async (mealId: string) => {
      const meal = meals.find((m) => m.id === mealId);
      if (!supabase || !meal) return;
      setDeletingId(meal.id);
      try {
        const { error } = await supabase
          .from("meals")
          .delete()
          .eq("id", meal.id);
        if (error) throw error;
        if (meal.image_path) await deleteMealImage(meal.image_path);
        setMeals((prev) => prev.filter((m) => m.id !== meal.id));
        toaster.create({ title: "削除しました", type: "success" });
      } catch {
        toaster.create({ title: "削除に失敗しました", type: "error" });
      } finally {
        setDeletingId(null);
      }
    },
    [meals, setMeals],
  );

  // 表示順（日付降順→時間帯順）に並べてからページ分を切り出す
  const filteredMeals = useMemo(() => {
    // eaten_at は YYYY-MM-DD 形式のため、表示月（YYYY-MM）との前方一致で絞り込める
    const filtered = meals.filter(
      (m) =>
        (mealTimeFilter === "all" || m.meal_time === mealTimeFilter) &&
        (!month || m.eaten_at.startsWith(`${month}-`)),
      // 日付範囲フィルタ（コメントアウト中）。文字列比較で範囲判定できる
      // && (!dateFrom || m.eaten_at >= dateFrom) &&
      // (!dateTo || m.eaten_at <= dateTo),
    );
    return sortMealsForList(filtered, sortOrder);
  }, [meals, mealTimeFilter, month, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredMeals.length / PAGE_SIZE));
  // 削除などで件数が減った場合もページ範囲内に収める
  const currentPage = Math.min(page, totalPages);

  const pagedGroups = useMemo(
    () =>
      groupByDate(
        filteredMeals.slice(
          (currentPage - 1) * PAGE_SIZE,
          currentPage * PAGE_SIZE,
        ),
        sortOrder,
      ),
    [filteredMeals, currentPage, sortOrder],
  );

  return (
    <Box
      bg="gray.50"
      minH="100svh"
      px={{ base: 4, md: 8 }}
      py={{ base: 8, md: 12 }}
    >
      <Box maxW="720px" mx="auto">
        {/* ヘッダー */}
        <ListHeader totalCount={meals.length} />

        {/* 時間帯フィルタ */}
        <MealTimeFilter
          value={mealTimeFilter}
          onChange={handleMealTimeFilterChange}
        />

        {/* 表示月フィルタ・並び順 */}
        <Flex align="center" justify="space-between" gap={3} mb={6} wrap="wrap">
          <MonthFilter value={month} onChange={handleMonthChange} />
          <SortOrderFilter value={sortOrder} onChange={handleSortOrderChange} />
        </Flex>

        {/* 日付フィルタ（表示月フィルタに置き換え。再採用に備えて残す） */}
        {/* <DateRangeFilter
          from={dateFrom}
          to={dateTo}
          onChange={handleDateRangeChange}
        /> */}

        {/* 食事記録リスト */}
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="lg" color="teal.500" borderWidth="3px" />
          </Flex>
        ) : filteredMeals.length === 0 ? (
          // 日付範囲フィルタ使用時: mealTimeFilter !== "all" || !!dateFrom || !!dateTo
          <EmptyMealList isFiltered={mealTimeFilter !== "all" || !!month} />
        ) : (
          <>
            <MealGroupList
              groups={pagedGroups}
              deletingId={deletingId}
              onPreviewImage={setPreviewImageUrl}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />

            {/* ページャー */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Box>

      <MealFormModal
        open={isMealModalOpen}
        initialMeal={editingMeal ?? undefined}
        onClose={() => {
          setIsMealModalOpen(false);
          setEditingMeal(null);
        }}
      />

      <ImageLightbox
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </Box>
  );
});
