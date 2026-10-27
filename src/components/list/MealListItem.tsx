import { memo } from "react";
import type { FC } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import { MealThumbnail } from "@/components/ui/MealThumbnail";
import type { Meal, MealTime } from "@/types/meal";
import { MEAL_TIME_META } from "@/constants/mealTime";
import { getMealImageUrl } from "@/utils/imageUpload";

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

type MealListItemProps = {
  meal: Meal;
  isDeleting: boolean;
  onPreviewImage: (imageUrl: string | null) => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
};

export const MealListItem: FC<MealListItemProps> = memo(
  ({ meal, isDeleting, onPreviewImage, onEdit, onDelete }) => {
    const imagePath = meal.image_path;
    return (
      <Flex
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
        <MealThumbnail
          imagePath={imagePath}
          size="44px"
          onClick={
            imagePath
              ? () => onPreviewImage(getMealImageUrl(imagePath))
              : undefined
          }
        />
        <MealTimeBadge mealTime={meal.meal_time} />
        <Box flex={1} minW={0}>
          <Text color="gray.900" fontWeight="semibold" truncate>
            {meal.name}
          </Text>
          {meal.memo && (
            <Text fontSize="sm" color="gray.500" mt={0.5} lineClamp={2}>
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
          onClick={() => onEdit(meal)}
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
          loading={isDeleting}
          onClick={() => onDelete(meal)}
          _hover={{ bg: "red.50", color: "red.500" }}
          flexShrink={0}
        >
          <FaRegTrashAlt size={15} />
        </IconButton>
      </Flex>
    );
  },
);
