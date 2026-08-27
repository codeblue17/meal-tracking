import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaLayerGroup,
  FaPlus,
  FaRegClock,
  FaUtensils,
} from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { MealFormModal } from "@/components/ui/MealFormModal";
import { MealThumbnail } from "@/components/ui/MealThumbnail";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_META, MEAL_TIME_ORDER } from "@/constants/mealTime";
import { toDateStr } from "@/utils/dateUtils";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { getMealImageUrl } from "@/utils/imageUpload";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { cardStyle } from "@/styles/dashboardCardStyle";

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
/*  小コンポーネント                                                           */
/* -------------------------------------------------------------------------- */

const SectionTitle: FC<{ icon: IconType; children: string }> = memo(
  ({ icon, children }) => (
    <HStack gap={2.5} mb={5}>
      <Icon as={icon} color="teal.500" boxSize={4} />
      <Heading as="h3" fontSize="md" color="gray.900">
        {children}
      </Heading>
    </HStack>
  ),
);

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
            <Box {...cardStyle} p={{ base: 5, md: 6 }}>
              <SectionTitle icon={FaUtensils}>今日の食事</SectionTitle>
              <Stack gap={3}>
                {stats.todaySlots.map(({ mealTime, meals: slotMeals }) => {
                  const meta = MEAL_TIME_META[mealTime];
                  const filled = slotMeals.length > 0;
                  const slotImagePath =
                    slotMeals.find((m) => m.image_path)?.image_path ?? null;
                  return (
                    <Flex
                      key={mealTime}
                      align="center"
                      gap={4}
                      px={4}
                      py={3.5}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={
                        filled ? `${meta.colorPalette}.100` : "gray.100"
                      }
                      bg={filled ? `${meta.colorPalette}.50` : "gray.50"}
                      transition="all 0.2s ease"
                    >
                      <Flex
                        align="center"
                        justify="center"
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="white"
                        color={`${meta.colorPalette}.600`}
                        fontSize="xs"
                        fontWeight="semibold"
                        minW="48px"
                        flexShrink={0}
                        boxShadow="0 2px 6px rgba(15, 23, 42, 0.06)"
                      >
                        {meta.label}
                      </Flex>
                      {filled && (
                        <MealThumbnail
                          imagePath={slotImagePath}
                          size="36px"
                          onClick={
                            slotImagePath
                              ? () =>
                                  setPreviewImageUrl(
                                    getMealImageUrl(slotImagePath),
                                  )
                              : undefined
                          }
                        />
                      )}
                      <Box flex={1} minW={0}>
                        {filled ? (
                          <Text color="gray.900" fontWeight="semibold" truncate>
                            {slotMeals.map((m) => m.name).join("、")}
                          </Text>
                        ) : (
                          <Text color="gray.400" fontSize="sm">
                            未記録
                          </Text>
                        )}
                      </Box>
                      {filled ? (
                        <Flex
                          boxSize={6}
                          borderRadius="full"
                          bg={`${meta.colorPalette}.500`}
                          color="white"
                          align="center"
                          justify="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          {slotMeals.length}
                        </Flex>
                      ) : (
                        <Icon
                          as={FaPlus}
                          color="gray.300"
                          boxSize={3}
                          cursor="pointer"
                          flexShrink={0}
                          onClick={() => openMealModal(mealTime)}
                          _hover={{ color: "teal.500" }}
                        />
                      )}
                    </Flex>
                  );
                })}
              </Stack>
            </Box>

            {/* 週間アクティビティ */}
            <Box {...cardStyle} p={{ base: 5, md: 6 }}>
              <SectionTitle icon={FaCalendarCheck}>
                週間アクティビティ
              </SectionTitle>
              <Flex
                align="flex-end"
                justify="space-between"
                gap={{ base: 2, md: 3 }}
                h="160px"
              >
                {stats.weekly.map((day) => {
                  const ratio = day.count / stats.weeklyMax;
                  return (
                    <Flex
                      key={day.key}
                      direction="column"
                      align="center"
                      justify="flex-end"
                      flex={1}
                      h="full"
                      gap={2}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={day.count > 0 ? "gray.700" : "gray.300"}
                      >
                        {day.count}
                      </Text>
                      <Box
                        w="full"
                        maxW="34px"
                        h={`${Math.max(ratio * 100, day.count > 0 ? 14 : 4)}%`}
                        minH="6px"
                        borderRadius="lg"
                        transition="height 0.3s ease"
                        style={{
                          background: day.isToday
                            ? "linear-gradient(180deg, #2dd4bf, #0d9488)"
                            : day.count > 0
                              ? "linear-gradient(180deg, #99f6e4, #5eead4)"
                              : "#f1f5f9",
                        }}
                      />
                      <Text
                        fontSize="xs"
                        fontWeight={day.isToday ? "bold" : "medium"}
                        color={day.isToday ? "teal.600" : "gray.400"}
                      >
                        {day.weekday}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          </Stack>

          {/* ----- 右カラム ----- */}
          <Stack gap={{ base: 5, md: 6 }}>
            {/* 時間帯の割合 */}
            <Box {...cardStyle} p={{ base: 5, md: 6 }}>
              <SectionTitle icon={FaLayerGroup}>時間帯の割合</SectionTitle>
              <Stack gap={4}>
                {stats.distribution.map(({ mealTime, count }) => {
                  const meta = MEAL_TIME_META[mealTime];
                  const pct =
                    stats.total > 0
                      ? Math.round((count / stats.total) * 100)
                      : 0;
                  return (
                    <Box key={mealTime}>
                      <Flex justify="space-between" align="center" mb={1.5}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.700"
                        >
                          {meta.label}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="gray.400"
                          fontWeight="medium"
                        >
                          {count}件 ・ {pct}%
                        </Text>
                      </Flex>
                      <Box
                        w="full"
                        h="8px"
                        borderRadius="full"
                        bg="gray.100"
                        overflow="hidden"
                      >
                        <Box
                          h="full"
                          w={`${pct}%`}
                          minW={count > 0 ? "8px" : "0"}
                          borderRadius="full"
                          bg={`${meta.colorPalette}.400`}
                          transition="width 0.4s ease"
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* 最近の記録 */}
            <Box {...cardStyle} p={{ base: 5, md: 6 }}>
              <Flex justify="space-between" align="center" mb={5}>
                <HStack gap={2.5}>
                  <Icon as={FaRegClock} color="teal.500" boxSize={4} />
                  <Heading as="h3" fontSize="md" color="gray.900">
                    最近の記録
                  </Heading>
                </HStack>
                <HStack
                  as={RouterLink}
                  {...{ to: "/list" }}
                  gap={1}
                  color="teal.600"
                  fontSize="xs"
                  fontWeight="semibold"
                  _hover={{ color: "teal.700" }}
                >
                  <Text>すべて見る</Text>
                  <Icon as={FaArrowRight} boxSize={2.5} />
                </HStack>
              </Flex>

              {stats.recent.length === 0 ? (
                <Flex direction="column" align="center" py={8} px={4}>
                  <Flex
                    boxSize={12}
                    borderRadius="full"
                    bg="teal.50"
                    color="teal.500"
                    align="center"
                    justify="center"
                    mb={3}
                  >
                    <Icon as={FaUtensils} boxSize={4} />
                  </Flex>
                  <Text
                    color="gray.700"
                    fontWeight="semibold"
                    fontSize="sm"
                    mb={1}
                  >
                    まだ記録がありません
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    最初の食事を記録してみましょう
                  </Text>
                </Flex>
              ) : (
                <Stack gap={2.5}>
                  {stats.recent.map((meal) => {
                    const meta = MEAL_TIME_META[meal.meal_time];
                    return (
                      <Flex key={meal.id} align="center" gap={3}>
                        <Box
                          boxSize={2.5}
                          borderRadius="full"
                          bg={`${meta.colorPalette}.400`}
                          flexShrink={0}
                        />
                        <MealThumbnail
                          imagePath={meal.image_path}
                          size="32px"
                          onClick={
                            meal.image_path
                              ? () =>
                                  setPreviewImageUrl(
                                    getMealImageUrl(meal.image_path!),
                                  )
                              : undefined
                          }
                        />
                        <Text
                          color="gray.800"
                          fontSize="sm"
                          fontWeight="medium"
                          truncate
                          flex={1}
                          minW={0}
                        >
                          {meal.name}
                        </Text>
                        <Text fontSize="xs" color="gray.400" flexShrink={0}>
                          {meta.label}
                        </Text>
                      </Flex>
                    );
                  })}
                </Stack>
              )}
            </Box>
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
