import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SharedMealsResult } from "@/types/mealShare";

// 共有リンクのトークンから共有範囲の食事を取得する（ログイン不要）。
// 閲覧者は栄養士などアプリの利用者ではないため、取得失敗はトーストではなく error で返し、ページ側で表示する
export const useSharedMeals = (token: string | undefined) => {
  const [result, setResult] = useState<SharedMealsResult | null>(
    token ? null : { status: "not_found" },
  );
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase && token));

  useEffect(() => {
    const client = supabase;
    if (!client || !token) return;
    let active = true;
    const fetchSharedMeals = async (): Promise<SharedMealsResult> => {
      const { data, error } = await client.rpc("get_shared_meals", {
        p_token: token,
      });
      if (error) throw error;
      return data as SharedMealsResult;
    };
    fetchSharedMeals()
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  return { result, loading, error };
};
