import { memo } from "react";
import type { FC } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaArrowRight, FaRegClock, FaUtensils } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { MealThumbnail } from "@/components/ui/MealThumbnail";
import type { Meal } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";
import { getMealImageUrl } from "@/utils/imageUpload";
import { cardStyle } from "@/styles/dashboardCardStyle";

type RecentMealsSectionProps = {
  recent: Meal[];
  onPreviewImage: (imageUrl: string | null) => void;
};

export const RecentMealsSection: FC<RecentMealsSectionProps> = memo(
  ({ recent, onPreviewImage }) => (
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

      {recent.length === 0 ? (
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
          <Text color="gray.700" fontWeight="semibold" fontSize="sm" mb={1}>
            まだ記録がありません
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            最初の食事を記録してみましょう
          </Text>
        </Flex>
      ) : (
        <Stack gap={2.5}>
          {recent.map((meal) => {
            const meta = MEAL_TIME_META[meal.meal_time];
            const imagePath = meal.image_path;
            return (
              <Flex key={meal.id} align="center" gap={3}>
                <Box
                  boxSize={2.5}
                  borderRadius="full"
                  bg={`${meta.colorPalette}.400`}
                  flexShrink={0}
                />
                <MealThumbnail
                  imagePath={imagePath}
                  size="32px"
                  onClick={
                    imagePath
                      ? () => onPreviewImage(getMealImageUrl(imagePath))
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
  ),
);
