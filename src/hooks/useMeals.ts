import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster-instance";
import type { Meal } from "@/types/meal";

const notifyFetchError = () => {
  toaster.create({ title: "食事の取得に失敗しました", type: "error" });
};

// ログインユーザーの食事を新しい順に取得し、再取得用の refresh を提供する
export const useMeals = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase && user));

  // データ取得のみを担い、状態更新は呼び出し側（effect / refresh）で行う
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
      .catch(notifyFetchError)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchMeals]);

  const refresh = useCallback(() => {
    fetchMeals().then(setMeals).catch(notifyFetchError);
  }, [fetchMeals]);

  return { meals, setMeals, loading, refresh };
};
