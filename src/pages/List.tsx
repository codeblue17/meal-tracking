import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaRegTrashAlt, FaUtensils } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { MealFormModal } from "@/components/ui/MealFormModal";
import type { Meal, MealTime } from "@/types/meal";
import { formatGroupDate } from "@/utils/dateUtils";

type MealTimeMeta = {
  label: string;
  colorPalette: string;
  order: number;
};

const MEAL_TIME_META: Record<MealTime, MealTimeMeta> = {
  breakfast: { label: "朝食", colorPalette: "orange", order: 0 },
  lunch: { label: "昼食", colorPalette: "teal", order: 1 },
  dinner: { label: "夕食", colorPalette: "purple", order: 2 },
  snack: { label: "間食", colorPalette: "pink", order: 3 },
};

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
  const [filter, setFilter] = useState<MealTime | "all">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("meals").delete().eq("id", id);
      if (error) throw error;
      setMeals((prev) => prev.filter((m) => m.id !== id));
      toaster.create({ title: "削除しました", type: "success" });
    } catch {
      toaster.create({ title: "削除に失敗しました", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGroups = useMemo(() => {
    const filtered =
      filter === "all" ? meals : meals.filter((m) => m.meal_time === filter);
    return groupByDate(filtered);
  }, [meals, filter]);

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
            const isActive = filter === item.value;
            return (
              <Button
                key={item.value}
                size="sm"
                borderRadius="full"
                variant={isActive ? "solid" : "outline"}
                colorPalette={isActive ? "teal" : "gray"}
                onClick={() => setFilter(item.value)}
                fontWeight={isActive ? "semibold" : "medium"}
                flexShrink={0}
              >
                {item.label}
              </Button>
            );
          })}
        </HStack>

        {/* 本体 */}
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="lg" color="teal.500" borderWidth="3px" />
          </Flex>
        ) : filteredGroups.length === 0 ? (
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
              {filter === "all"
                ? "まだ食事の記録がありません"
                : "この時間帯の記録はありません"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              「食事を記録」から最初の記録を追加しましょう
            </Text>
          </Flex>
        ) : (
          <Stack gap={8}>
            {filteredGroups.map((group) => (
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
                        aria-label="削除"
                        color="gray.400"
                        loading={deletingId === meal.id}
                        onClick={() => handleDelete(meal.id)}
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
        )}
      </Box>

      <MealFormModal
        open={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          refresh();
        }}
      />
    </Box>
  );
});
