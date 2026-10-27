import { memo } from "react";
import type { FC } from "react";
import { Box, Stack, Text } from "@chakra-ui/react";
import { MealListItem } from "@/components/list/MealListItem";
import type { Meal } from "@/types/meal";
import { formatGroupDate } from "@/utils/dateUtils";

export type DateGroup = {
  date: string;
  meals: Meal[];
};

type MealGroupListProps = {
  groups: DateGroup[];
  deletingId: string | null;
  onPreviewImage: (imageUrl: string | null) => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
};

export const MealGroupList: FC<MealGroupListProps> = memo(
  ({ groups, deletingId, onPreviewImage, onEdit, onDelete }) => (
    <Stack gap={8}>
      {groups.map((group) => (
        <Box key={group.date}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={3} px={1}>
            {formatGroupDate(group.date)}
          </Text>
          <Stack gap={3}>
            {group.meals.map((meal) => (
              <MealListItem
                key={meal.id}
                meal={meal}
                isDeleting={deletingId === meal.id}
                onPreviewImage={onPreviewImage}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  ),
);
