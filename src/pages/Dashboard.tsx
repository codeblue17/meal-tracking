import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { Box, Flex, Grid, Spinner, Stack } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { MealFormModal } from "@/components/ui/MealFormModal";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_ORDER } from "@/constants/mealTime";
import { toDateStr } from "@/utils/dateUtils";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { TodayMealsSection } from "@/components/dashboard/TodayMealsSection";
import { WeeklyActivitySection } from "@/components/dashboard/WeeklyActivitySection";
import { MealTimeDistributionSection } from "@/components/dashboard/MealTimeDistributionSection";
import { RecentMealsSection } from "@/components/dashboard/RecentMealsSection";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

/* -------------------------------------------------------------------------- */
/*  集計ヘルパー（純粋関数）                                                    */
/* -------------------------------------------------------------------------- */

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// 今日から過去 n 日ぶんの Date を、古い順に返す
const lastNDays = (n: number): Date[] => {
  const base = startOfToday();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - (n - 1 - i));
    return d;
  });
};

// 連続記録集計
// 今日（記録が無ければ昨日）から遡って連続で記録のある日数を数える
const computeStreak = (recordedDates: Set<string>): number => {
  const cursor = startOfToday();
  if (!recordedDates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (recordedDates.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/* -------------------------------------------------------------------------- */
/*  ダッシュボード本体                                                         */
/* -------------------------------------------------------------------------- */

export const Dashboard: FC = memo(() => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase && user));
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealModalInitialTime, setMealModalInitialTime] = useState<
    MealTime | undefined
  >(undefined);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const openMealModal = useCallback((mealTime?: MealTime) => {
    setMealModalInitialTime(mealTime);
    setIsMealModalOpen(true);
  }, []);

  const fetchMeals = useCallback(async (): Promise<Meal[]> => {
    if (!supabase || !user) return [];
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .order("eaten_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Meal[]) ?? [];
  }, [user]);

  useEffect(() => {
    let active = true;
    fetchMeals()
      .then((data) => {
        if (active) setMeals(data);
      })
      .catch(() => {
        toaster.create({ title: "食事の取得に失敗しました", type: "error" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchMeals]);

  const refresh = useCallback(() => {
    fetchMeals()
      .then(setMeals)
      .catch(() => {
        toaster.create({ title: "食事の取得に失敗しました", type: "error" });
      });
  }, [fetchMeals]);

  /* ---- 集計 ---- */
  const stats = useMemo(() => {
    const today = toDateStr(new Date());
    const recordedDates = new Set(meals.map((m) => m.eaten_at));
    const weekDays = lastNDays(7);
    const weekKeys = new Set(weekDays.map(toDateStr));

    const todayMeals = meals.filter((m) => m.eaten_at === today);
    const weekTotal = meals.filter((m) => weekKeys.has(m.eaten_at)).length;

    // 週間アクティビティ（過去7日・古い順）
    const weekly = weekDays.map((d) => {
      const key = toDateStr(d);
      return {
        key,
        weekday: WEEKDAY_LABELS[d.getDay()],
        count: meals.filter((m) => m.eaten_at === key).length,
        isToday: key === today,
      };
    });
    const weeklyMax = Math.max(1, ...weekly.map((w) => w.count));

    // 時間帯の割合
    const distribution = MEAL_TIME_ORDER.map((mt) => ({
      mealTime: mt,
      count: meals.filter((m) => m.meal_time === mt).length,
    }));

    // 今日の4スロット
    const todaySlots = MEAL_TIME_ORDER.map((mt) => ({
      mealTime: mt,
      meals: todayMeals
        .filter((m) => m.meal_time === mt)
        .sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    }));

    return {
      todayCount: todayMeals.length,
      streak: computeStreak(recordedDates),
      weekTotal,
      total: meals.length,
      weekly,
      weeklyMax,
      distribution,
      todaySlots,
      recent: meals.slice(0, 5),
    };
  }, [meals]);

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
