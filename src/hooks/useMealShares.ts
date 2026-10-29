import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import type { MealShare } from "@/types/mealShare";
import { SHARE_EXPIRY_OPTIONS } from "@/constants/share";
import type { ShareExpiry } from "@/constants/share";
import { toDateStr } from "@/utils/dateUtils";
import { validateShareInput } from "@/utils/shareValidation";

export type ShareFormValues = {
  label: string;
  startDate: Date;
  // null は継続共有
  endDate: Date | null;
  expiry: ShareExpiry;
  includeMemo: boolean;
  includeImages: boolean;
};

// user_id は返さない（画面では使わないため）
const SHARE_COLUMNS =
  "id, token, label, start_date, end_date, expires_at, revoked_at, include_memo, include_images, created_at";

const DAY_MS = 24 * 60 * 60 * 1000;

const expiryDays = (expiry: ShareExpiry): number =>
  SHARE_EXPIRY_OPTIONS.find((option) => option.value === expiry)?.days ??
  SHARE_EXPIRY_OPTIONS[0].days;

const notifyFetchError = () => {
  toaster.create({ title: "共有リンクの取得に失敗しました", type: "error" });
};

// ログインユーザーの有効な共有リンク（期限内・未無効化）を新しい順に取得し、発行・無効化を提供する。
// 結果はトーストで通知し、createShare は発行したリンク（失敗時は null）、revokeShare は成否を返す
export const useMealShares = () => {
  const { user } = useAuth();
  const [shares, setShares] = useState<MealShare[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase && user));
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchShares = useCallback(async (): Promise<MealShare[]> => {
    if (!supabase || !user) return [];
    const { data, error } = await supabase
      .from("meal_shares")
      .select(SHARE_COLUMNS)
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as MealShare[]) ?? [];
  }, [user]);

  useEffect(() => {
    let active = true;
    fetchShares()
      .then((data) => {
        if (active) setShares(data);
      })
      .catch(notifyFetchError)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchShares]);

  const createShare = useCallback(
    async (values: ShareFormValues): Promise<MealShare | null> => {
      if (!supabase || !user) return null;
      const validation = validateShareInput(
        values.label,
        values.startDate,
        values.endDate,
      );
      if (!validation.ok) {
        toaster.create({ title: validation.message, type: "error" });
        return null;
      }

      setCreating(true);
      try {
        // user_id・token は DB 側で自動設定される（クライアントからは指定できない）
        const { data, error } = await supabase
          .from("meal_shares")
          .insert({
            label: validation.label,
            start_date: toDateStr(values.startDate),
            end_date: values.endDate ? toDateStr(values.endDate) : null,
            expires_at: new Date(
              Date.now() + expiryDays(values.expiry) * DAY_MS,
            ).toISOString(),
            include_memo: values.includeMemo,
            include_images: values.includeImages,
          })
          .select(SHARE_COLUMNS)
          .single();
        if (error) throw error;
        const share = data as MealShare;
        setShares((prev) => [share, ...prev]);
        toaster.create({ title: "共有リンクを発行しました", type: "success" });
        return share;
      } catch {
        toaster.create({
          title: "共有リンクの発行に失敗しました",
          type: "error",
        });
        return null;
      } finally {
        setCreating(false);
      }
    },
    [user],
  );

  const revokeShare = useCallback(async (shareId: string): Promise<boolean> => {
    if (!supabase) return false;
    setRevokingId(shareId);
    try {
      const { error } = await supabase
        .from("meal_shares")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", shareId);
      if (error) throw error;
      setShares((prev) => prev.filter((share) => share.id !== shareId));
      toaster.create({ title: "共有リンクを無効化しました", type: "success" });
      return true;
    } catch {
      toaster.create({
        title: "共有リンクの無効化に失敗しました",
        type: "error",
      });
      return false;
    } finally {
      setRevokingId(null);
    }
  }, []);

  return { shares, loading, creating, revokingId, createShare, revokeShare };
};
