import { memo, useCallback, useState } from "react";
import type { FC } from "react";
import { Box, Flex, Grid, Spinner, Stack } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { useMeals } from "@/hooks/useMeals";
import { MealFormModal } from "@/components/ui/MealFormModal";
import type { MealTime } from "@/types/meal";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { TodayMealsSection } from "@/components/dashboard/TodayMealsSection";
import { WeeklyActivitySection } from "@/components/dashboard/WeeklyActivitySection";
import { MealTimeDistributionSection } from "@/components/dashboard/MealTimeDistributionSection";
import { RecentMealsSection } from "@/components/dashboard/RecentMealsSection";

/* -------------------------------------------------------------------------- */
/*  ダッシュボード本体                                                         */
/* -------------------------------------------------------------------------- */

export const Dashboard: FC = memo(() => {
  const { user } = useAuth();
  const { meals, loading } = useMeals();
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealModalInitialTime, setMealModalInitialTime] = useState<
    MealTime | undefined
  >(undefined);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const openMealModal = useCallback((mealTime?: MealTime) => {
    setMealModalInitialTime(mealTime);
    setIsMealModalOpen(true);
  }, []);

  /* ---- 集計 ---- */
  const stats = useDashboardStats(meals);

  if (loading) {
    return (
      <Box bg="gray.50" minH="100svh">
        <Flex justify="center" align="center" minH="60svh">
          <Spinner size="xl" color="teal.500" borderWidth="3px" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      minH="100svh"
      bg="gray.50"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
    >
      <Box maxW="1120px" mx="auto">
        {/* ============== ヒーロー ============== */}
        <HeroSection
          userEmail={user?.email}
          userFullName={user?.user_metadata?.full_name as string | undefined}
          todayCount={stats.todayCount}
          onAddMeal={() => openMealModal()}
        />

        {/* ============== 統計カード ============== */}
        <StatsSection
          todayCount={stats.todayCount}
          streak={stats.streak}
          weekTotal={stats.weekTotal}
          total={stats.total}
        />

        {/* ============== メイングリッド ============== */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }}
          gap={{ base: 5, md: 6 }}
        >
          {/* ----- 左カラム ----- */}
          <Stack gap={{ base: 5, md: 6 }}>
            {/* 今日の食事 */}
            <TodayMealsSection
              todaySlots={stats.todaySlots}
              onAddMeal={openMealModal}
              onPreviewImage={setPreviewImageUrl}
            />

            {/* 週間アクティビティ */}
            <WeeklyActivitySection
              weekly={stats.weekly}
              weeklyMax={stats.weeklyMax}
            />
          </Stack>

          {/* ----- 右カラム ----- */}
          <Stack gap={{ base: 5, md: 6 }}>
            {/* 時間帯の割合 */}
            <MealTimeDistributionSection
              distribution={stats.distribution}
              total={stats.total}
            />

            {/* 最近の記録 */}
            <RecentMealsSection
              recent={stats.recent}
              onPreviewImage={setPreviewImageUrl}
            />
          </Stack>
        </Grid>
      </Box>

      <MealFormModal
        open={isMealModalOpen}
        initialMealTime={mealModalInitialTime}
        onClose={() => {
          setIsMealModalOpen(false);
          setMealModalInitialTime(undefined);
        }}
      />

      <ImageLightbox
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </Box>
  );
});
