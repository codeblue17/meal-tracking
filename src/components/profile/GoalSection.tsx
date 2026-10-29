import { memo, useState } from "react";
import type { FC } from "react";
import { Box, Button, Grid, Stack, Text, Textarea } from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";
import { FormField } from "@/components/ui/FormField";

const GOAL_DETAIL_MAX_LENGTH = 200;

const GOAL_TYPES = [
  { value: "weight_loss", label: "減量" },
  { value: "weight_gain", label: "増量" },
  { value: "maintain", label: "健康維持" },
  { value: "muscle_gain", label: "筋力アップ" },
] as const;

export type GoalType = (typeof GOAL_TYPES)[number]["value"];

type GoalSectionProps = {
  initialGoalType: GoalType | undefined;
  initialGoalDetail: string | undefined;
};

export const GoalSection: FC<GoalSectionProps> = memo(
  ({ initialGoalType, initialGoalDetail }) => {
    const [goalType, setGoalType] = useState<GoalType | "">(
      initialGoalType ?? "",
    );
    const [goalDetail, setGoalDetail] = useState(initialGoalDetail ?? "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      if (!goalType) {
        toaster.create({ title: "目標タイプを選択してください", type: "error" });
        return;
      }
      if (!supabase) return;
      const trimmedGoalDetail = goalDetail.trim();
      if (trimmedGoalDetail.length > GOAL_DETAIL_MAX_LENGTH) {
        toaster.create({
          title: `具体的な目標は${GOAL_DETAIL_MAX_LENGTH}文字以内で入力してください`,
          type: "error",
        });
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: { goal_type: goalType, goal_detail: trimmedGoalDetail },
        });
        if (error) throw error;
        toaster.create({ title: "目標を保存しました", type: "success" });
      } catch {
        toaster.create({ title: "目標の保存に失敗しました", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Box
        px={{ base: 6, md: 12 }}
        py={8}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Text color="teal.600" fontWeight="semibold" fontSize="xl" mb={5}>
          目標設定
        </Text>
        <Stack gap={4}>
          <FormField label="目標タイプ">
            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
              {GOAL_TYPES.map((item) => {
                const isSelected = goalType === item.value;
                return (
                  <Button
                    key={item.value}
                    size="md"
                    borderRadius="xl"
                    variant={isSelected ? "solid" : "outline"}
                    colorPalette={isSelected ? "teal" : "gray"}
                    onClick={() => setGoalType(item.value)}
                    type="button"
                    fontWeight={isSelected ? "semibold" : "medium"}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Grid>
          </FormField>
          <FormField label="具体的な目標">
            <Textarea
              placeholder="例: 3ヶ月で体重を3kg減らす（任意）"
              value={goalDetail}
              onChange={(e) => setGoalDetail(e.target.value)}
              maxLength={GOAL_DETAIL_MAX_LENGTH}
              minH="100px"
              resize="none"
              {...inputStyle}
            />
          </FormField>
          <PrimaryButton loading={loading} onClick={handleSave} mt={1}>
            目標を保存する
          </PrimaryButton>
        </Stack>
      </Box>
    );
  },
);
