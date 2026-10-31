import { memo, useState } from "react";
import type { FC } from "react";
import { Stack, Textarea } from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import { inputStyle } from "@/styles/formStyles";
import { FormField } from "@/components/ui/FormField";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ChoiceButtonGroup } from "@/components/ui/ChoiceButtonGroup";
import { GOAL_TYPES } from "@/constants/goal";
import type { GoalType } from "@/constants/goal";

const GOAL_DETAIL_MAX_LENGTH = 200;

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
        toaster.create({
          title: "目標タイプを選択してください",
          type: "error",
        });
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
      <ProfileSection title="目標設定">
        <Stack gap={4}>
          <FormField label="目標タイプ">
            <ChoiceButtonGroup
              options={GOAL_TYPES}
              value={goalType}
              onChange={setGoalType}
            />
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
      </ProfileSection>
    );
  },
);
