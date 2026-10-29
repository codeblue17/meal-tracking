import { memo, useCallback, useState } from "react";
import type { FC } from "react";
import {
  Box,
  Checkbox,
  Field,
  Fieldset,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { inputStyle } from "@/styles/formStyles";
import { FormField } from "@/components/ui/FormField";
import { DateField } from "@/components/ui/DateField";
import { ChoiceButtonGroup } from "@/components/ui/ChoiceButtonGroup";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ShareLinkItem } from "@/components/profile/ShareLinkItem";
import { RevokeShareDialog } from "@/components/profile/RevokeShareDialog";
import { useMealShares } from "@/hooks/useMealShares";
import type { MealShare } from "@/types/mealShare";
import { SHARE_EXPIRY_OPTIONS, SHARE_LABEL_MAX_LENGTH } from "@/constants/share";
import type { ShareExpiry } from "@/constants/share";

const PERIOD_TYPES = [
  { value: "open", label: "継続して共有" },
  { value: "fixed", label: "日付を指定" },
] as const;

type PeriodType = (typeof PERIOD_TYPES)[number]["value"];

// 共有開始日の初期値（今日から何日前か）
const DEFAULT_START_DAYS_AGO = 30;

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

// 栄養士などに渡す、ログイン不要・読み取り専用の共有リンクを発行・管理する
export const ShareSection: FC = memo(() => {
  const { shares, loading, creating, revokingId, createShare, revokeShare } =
    useMealShares();

  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState(() =>
    daysAgo(DEFAULT_START_DAYS_AGO),
  );
  const [periodType, setPeriodType] = useState<PeriodType>("open");
  const [endDate, setEndDate] = useState(() => daysAgo(0));
  const [expiry, setExpiry] = useState<ShareExpiry>("30");
  // 共有する内容は本人が選んで含める（初期値は含めない）
  const [includeMemo, setIncludeMemo] = useState(false);
  const [includeImages, setIncludeImages] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<MealShare | null>(null);

  const handleCreate = async () => {
    const share = await createShare({
      label,
      startDate,
      endDate: periodType === "fixed" ? endDate : null,
      expiry,
      includeMemo,
      includeImages,
    });
    if (share) setLabel("");
  };

  const openRevokeDialog = useCallback(
    (share: MealShare) => setRevokeTarget(share),
    [],
  );
  const closeRevokeDialog = useCallback(() => setRevokeTarget(null), []);

  const handleRevoke = useCallback(async () => {
    if (!revokeTarget) return;
    const ok = await revokeShare(revokeTarget.id);
    if (ok) setRevokeTarget(null);
  }, [revokeTarget, revokeShare]);

  return (
    <ProfileSection title="食事記録の共有">
      <Text fontSize="sm" color="gray.600" mb={5}>
        管理栄養士などに、食事記録を読み取り専用で見てもらうリンクを発行します。リンクを知っている人は、ログインせずに閲覧できます。
      </Text>

      <Stack gap={8}>
        {/* 見せる食事記録（meals.eaten_at の範囲と、メモ・写真を含めるか） */}
        <Stack gap={4}>
          <Box>
            <Text color="gray.700" fontWeight="semibold">
              見せる食事記録
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              食事をした日がこの範囲の記録を表示します
            </Text>
          </Box>
          <FormField label="いつの食事から">
            <DateField value={startDate} onChange={setStartDate} />
          </FormField>
          <FormField label="いつの食事まで">
            <ChoiceButtonGroup
              options={PERIOD_TYPES}
              value={periodType}
              onChange={setPeriodType}
            />
            {periodType === "open" ? (
              <Field.HelperText fontSize="sm" color="gray.500">
                これから記録する食事も表示されます
              </Field.HelperText>
            ) : (
              <DateField value={endDate} onChange={setEndDate} />
            )}
          </FormField>
          {/* チェックボックスは Field で囲むと id が重複するため、Fieldset でまとめる */}
          <Fieldset.Root gap={2}>
            <Fieldset.Legend color="gray.700" fontSize="sm" fontWeight="medium">
              見せる内容
            </Fieldset.Legend>
            <Fieldset.HelperText fontSize="sm" color="gray.500">
              食事名・時間帯・日付は必ず表示されます
            </Fieldset.HelperText>
            <Stack gap={2}>
              <Checkbox.Root
                colorPalette="teal"
                checked={includeMemo}
                onCheckedChange={(e) => setIncludeMemo(e.checked === true)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>メモ</Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root
                colorPalette="teal"
                checked={includeImages}
                onCheckedChange={(e) => setIncludeImages(e.checked === true)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>写真</Checkbox.Label>
              </Checkbox.Root>
            </Stack>
          </Fieldset.Root>
        </Stack>

        {/* リンクの設定（共有相手と、リンクを開ける期間 = meal_shares.expires_at） */}
        <Stack gap={4}>
          <Text color="gray.700" fontWeight="semibold">
            リンクの設定
          </Text>
          <FormField label="共有相手の名前">
            <Input
              placeholder="例: 山田先生"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={SHARE_LABEL_MAX_LENGTH}
              {...inputStyle}
            />
          </FormField>
          <FormField label="リンクを開ける期間">
            <ChoiceButtonGroup
              options={SHARE_EXPIRY_OPTIONS}
              value={expiry}
              onChange={setExpiry}
            />
            <Field.HelperText fontSize="sm" color="gray.500">
              過ぎるとリンクが開けなくなります
            </Field.HelperText>
          </FormField>
        </Stack>

        <PrimaryButton loading={creating} onClick={handleCreate}>
          共有リンクを発行する
        </PrimaryButton>
      </Stack>

      <Text color="gray.700" fontWeight="semibold" mt={8} mb={3}>
        発行済みのリンク
      </Text>
      {loading ? (
        <Spinner size="md" color="teal.500" />
      ) : shares.length === 0 ? (
        <Text fontSize="sm" color="gray.500">
          有効な共有リンクはありません
        </Text>
      ) : (
        <Stack gap={3}>
          {shares.map((share) => (
            <ShareLinkItem
              key={share.id}
              share={share}
              isRevoking={revokingId === share.id}
              onRequestRevoke={openRevokeDialog}
            />
          ))}
        </Stack>
      )}

      <RevokeShareDialog
        label={revokeTarget?.label ?? null}
        loading={revokingId !== null}
        onConfirm={handleRevoke}
        onClose={closeRevokeDialog}
      />
    </ProfileSection>
  );
});
