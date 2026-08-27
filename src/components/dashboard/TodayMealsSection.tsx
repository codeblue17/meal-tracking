import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { FaPlus, FaUtensils } from "react-icons/fa";
import { MealThumbnail } from "@/components/ui/MealThumbnail";
import { SectionTitle } from "@/components/dashboard/parts/SectionTitle";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";
import { getMealImageUrl } from "@/utils/imageUpload";
import { cardStyle } from "@/styles/dashboardCardStyle";

type TodayMealsSectionProps = {
  todaySlots: { mealTime: MealTime; meals: Meal[] }[];
  onAddMeal: (mealTime: MealTime) => void;
  onPreviewImage: (imageUrl: string | null) => void;
};

export const TodayMealsSection: FC<TodayMealsSectionProps> = memo(
  ({ todaySlots, onAddMeal, onPreviewImage }) => (
    <Box {...cardStyle} p={{ base: 5, md: 6 }}>
      <SectionTitle icon={FaUtensils}>今日の食事</SectionTitle>
      <Stack gap={3}>
        {todaySlots.map(({ mealTime, meals: slotMeals }) => {
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
              borderColor={filled ? `${meta.colorPalette}.100` : "gray.100"}
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
                      ? () => onPreviewImage(getMealImageUrl(slotImagePath))
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
                  onClick={() => onAddMeal(mealTime)}
                  _hover={{ color: "teal.500" }}
                />
              )}
            </Flex>
          );
        })}
      </Stack>
    </Box>
  ),
);
