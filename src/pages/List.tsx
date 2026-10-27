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
import { DateRangeFilter } from "@/components/list/DateRangeFilter";
import type { DateRange } from "@/components/list/DateRangeFilter";
import { EmptyMealList } from "@/components/list/EmptyMealList";
import { MealGroupList } from "@/components/list/MealGroupList";
import type { DateGroup } from "@/components/list/MealGroupList";
import type { Meal } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";
import { deleteMealImage } from "@/utils/imageUpload";

const PAGE_SIZE = 10;

// 食事を日付ごとにまとめ、新しい日付が上・日付内は時間帯順に並べる
const groupByDate = (meals: Meal[]): DateGroup[] => {
  const map = new Map<string, Meal[]>();
  for (const meal of meals) {
    const list = map.get(meal.eaten_at);
    if (list) list.push(meal);
    else map.set(meal.eaten_at, [meal]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({
      date,
      meals: items.sort(
        (a, b) =>
          MEAL_TIME_META[a.meal_time].order - MEAL_TIME_META[b.meal_time].order,
      ),
    }));
};

export const List: FC = memo(() => {
  const { meals, setMeals, loading, refresh } = useMeals();
  const [mealTimeFilter, setMealTimeFilter] =
    useState<MealTimeFilterValue>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

  const handleDateRangeChange = useCallback(({ from, to }: DateRange) => {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  }, []);

  const openEditModal = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setIsMealModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (meal: Meal) => {
      if (!supabase) return;
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
    [setMeals],
  );

  // 表示順（日付降順→時間帯順）に並べてからページ分を切り出す
  const filteredMeals = useMemo(() => {
    // eaten_at は YYYY-MM-DD 形式のため文字列比較で範囲判定できる
    const filtered = meals.filter(
      (m) =>
        (mealTimeFilter === "all" || m.meal_time === mealTimeFilter) &&
        (!dateFrom || m.eaten_at >= dateFrom) &&
        (!dateTo || m.eaten_at <= dateTo),
    );
    return [...filtered].sort((a, b) => {
      if (a.eaten_at !== b.eaten_at) return a.eaten_at < b.eaten_at ? 1 : -1;
      return (
        MEAL_TIME_META[a.meal_time].order - MEAL_TIME_META[b.meal_time].order
      );
    });
  }, [meals, mealTimeFilter, dateFrom, dateTo]);

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
      ),
    [filteredMeals, currentPage],
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

        {/* 日付フィルタ */}
        <DateRangeFilter
          from={dateFrom}
          to={dateTo}
          onChange={handleDateRangeChange}
        />

        {/* 食事記録リスト */}
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="lg" color="teal.500" borderWidth="3px" />
          </Flex>
        ) : filteredMeals.length === 0 ? (
          <EmptyMealList
            isFiltered={mealTimeFilter !== "all" || !!dateFrom || !!dateTo}
          />
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
          refresh();
        }}
      />

      <ImageLightbox
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </Box>
  );
});
