import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaPen, FaRegTrashAlt, FaUtensils } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { MealFormModal } from "@/components/ui/MealFormModal";
import { MealThumbnail } from "@/components/ui/MealThumbnail";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";
import { formatGroupDate } from "@/utils/dateUtils";
import { deleteMealImage } from "@/utils/imageUpload";

const PAGE_SIZE = 10;

const FILTERS: { value: MealTime | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "breakfast", label: "朝食" },
  { value: "lunch", label: "昼食" },
  { value: "dinner", label: "夕食" },
  { value: "snack", label: "間食" },
];

type DateGroup = {
  date: string;
  meals: Meal[];
};

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

// 空の date input はブラウザ標準の「yyyy/mm/dd」が出て見栄えが悪いため、
// 未入力かつ非フォーカス時は日付テキストを透明にし、プレースホルダーを重ねて表示する
const DateFilterInput: FC<{
  value: string;
  placeholder: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}> = ({ value, placeholder, min, max, onChange }) => {
  const [focused, setFocused] = useState(false);
  const showPlaceholder = !value && !focused;
  return (
    <Box position="relative" w="170px" flexShrink={0}>
      <Input
        type="date"
        size="sm"
        bg="white"
        borderRadius="lg"
        borderColor="gray.200"
        color={showPlaceholder ? "transparent" : "gray.900"}
        cursor="pointer"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={(e) => {
          // 年・月・日のテキスト部分をクリックしてもカレンダーが開くようにする
          try {
            e.currentTarget.showPicker();
          } catch {
            // showPicker 未対応ブラウザでは標準の挙動に任せる
          }
        }}
        _focus={{
          borderColor: "teal.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
        }}
      />
      {showPlaceholder && (
        <Text
          position="absolute"
          top="50%"
          left={3}
          transform="translateY(-50%)"
          fontSize="sm"
          color="gray.400"
          pointerEvents="none"
        >
          {placeholder}
        </Text>
      )}
    </Box>
  );
};

const MealTimeBadge: FC<{ mealTime: MealTime }> = ({ mealTime }) => {
  const meta = MEAL_TIME_META[mealTime];
  return (
    <Flex
      align="center"
      justify="center"
      px={3}
      py={1}
      borderRadius="full"
      bg={`${meta.colorPalette}.50`}
      color={`${meta.colorPalette}.600`}
      fontSize="xs"
      fontWeight="semibold"
      flexShrink={0}
    >
      {meta.label}
    </Flex>
  );
};

export const List: FC = memo(() => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase && user));
  const [mealTimeFilter, setMealTimeFilter] = useState<MealTime | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // データ取得のみを担い、状態更新は呼び出し側（effect / イベントハンドラ）で行う
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

  const handleDelete = async (meal: Meal) => {
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
  };

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
        <Flex
          align={{ base: "start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={6}
        >
          <Box>
            <Heading
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              color="gray.900"
            >
              食事履歴一覧
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {meals.length} 件の記録
            </Text>
          </Box>
        </Flex>

        {/* 時間帯フィルタ */}
        <HStack gap={2} mb={6} overflowX="auto" pb={1}>
          {FILTERS.map((item) => {
            const isActive = mealTimeFilter === item.value;
            return (
              <Button
                key={item.value}
                size="sm"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                colorPalette={isActive ? "teal" : "gray"}
                onClick={() => {
                  setMealTimeFilter(item.value);
                  setPage(1);
                }}
                fontWeight={isActive ? "semibold" : "medium"}
                flexShrink={0}
              >
                {item.label}
              </Button>
            );
          })}
        </HStack>

        {/* 日付フィルタ */}
        <Flex align="center" gap={2} mb={6} wrap="wrap">
          <DateFilterInput
            value={dateFrom}
            placeholder="開始日"
            max={dateTo || undefined}
            onChange={(value) => {
              setDateFrom(value);
              setPage(1);
            }}
          />
          <Text fontSize="sm" color="gray.500" flexShrink={0}>
            〜
          </Text>
          <DateFilterInput
            value={dateTo}
            placeholder="終了日"
            min={dateFrom || undefined}
            onChange={(value) => {
              setDateTo(value);
              setPage(1);
            }}
          />
          {(dateFrom || dateTo) && (
            <Button
              size="sm"
              variant="ghost"
              colorPalette="gray"
              borderRadius="full"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              クリア
            </Button>
          )}
        </Flex>

        {/* 本体 */}
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="lg" color="teal.500" borderWidth="3px" />
          </Flex>
        ) : filteredMeals.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={16}
            px={6}
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="0 24px 70px rgba(15, 23, 42, 0.06)"
          >
            <Flex
              boxSize={14}
              borderRadius="full"
              bg="teal.50"
              color="teal.500"
              align="center"
              justify="center"
              mb={4}
            >
              <FaUtensils size={22} />
            </Flex>
            <Text color="gray.700" fontWeight="semibold" mb={1}>
              {mealTimeFilter === "all" && !dateFrom && !dateTo
                ? "まだ食事の記録がありません"
                : "条件に一致する記録はありません"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              「食事を記録」から最初の記録を追加しましょう
            </Text>
          </Flex>
        ) : (
          <>
            <Stack gap={8}>
              {pagedGroups.map((group) => (
                <Box key={group.date}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.500"
                    mb={3}
                    px={1}
                  >
                    {formatGroupDate(group.date)}
                  </Text>
                  <Stack gap={3}>
                    {group.meals.map((meal) => (
                      <Flex
                        key={meal.id}
                        align="center"
                        gap={4}
                        bg="white"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="gray.100"
                        boxShadow="0 8px 24px rgba(15, 23, 42, 0.05)"
                        px={{ base: 4, md: 5 }}
                        py={4}
                        transition="all 0.2s ease"
                        _hover={{
                          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.09)",
                        }}
                      >
                        <MealThumbnail imagePath={meal.image_path} />
                        <MealTimeBadge mealTime={meal.meal_time} />
                        <Box flex={1} minW={0}>
                          <Text color="gray.900" fontWeight="semibold" truncate>
                            {meal.name}
                          </Text>
                          {meal.memo && (
                            <Text
                              fontSize="sm"
                              color="gray.500"
                              mt={0.5}
                              lineClamp={2}
                            >
                              {meal.memo}
                            </Text>
                          )}
                        </Box>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          borderRadius="full"
                          aria-label="編集"
                          color="gray.400"
                          onClick={() => {
                            setEditingMeal(meal);
                            setIsMealModalOpen(true);
                          }}
                          _hover={{ bg: "teal.50", color: "teal.500" }}
                          flexShrink={0}
                        >
                          <FaPen size={13} />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          borderRadius="full"
                          aria-label="削除"
                          color="gray.400"
                          loading={deletingId === meal.id}
                          onClick={() => handleDelete(meal)}
                          _hover={{ bg: "red.50", color: "red.500" }}
                          flexShrink={0}
                        >
                          <FaRegTrashAlt size={15} />
                        </IconButton>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>

            {/* ページャー */}
            {totalPages > 1 && (
              <HStack justify="center" gap={2} mt={8}>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  borderRadius="full"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  前へ
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <Button
                      key={pageNumber}
                      size="sm"
                      borderRadius="full"
                      variant={pageNumber === currentPage ? "solid" : "ghost"}
                      colorPalette={
                        pageNumber === currentPage ? "teal" : "gray"
                      }
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ),
                )}
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="gray"
                  borderRadius="full"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  次へ
                </Button>
              </HStack>
            )}
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
    </Box>
  );
});
