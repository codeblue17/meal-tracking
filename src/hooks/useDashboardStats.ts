import { useMemo } from "react";
import type { Meal } from "@/types/meal";
import { MEAL_TIME_ORDER } from "@/constants/mealTime";
import { toDateStr } from "@/utils/dateUtils";
import { WEEKDAY_LABELS } from "@/constants/date";

/* -------------------------------------------------------------------------- */
/*  集計ヘルパー（純粋関数）                                                    */
/* -------------------------------------------------------------------------- */

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// 今日から過去 n 日ぶんの Date を、古い順に返す
export const lastNDays = (n: number): Date[] => {
  const base = startOfToday();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - (n - 1 - i));
    return d;
  });
};

// 連続記録集計
// 今日（記録が無ければ昨日）から遡って連続で記録のある日数を数える
export const computeStreak = (recordedDates: Set<string>): number => {
  const cursor = startOfToday();
  if (!recordedDates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (recordedDates.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/* -------------------------------------------------------------------------- */
/*  ダッシュボード集計フック                                                    */
/* -------------------------------------------------------------------------- */

export const useDashboardStats = (meals: Meal[]) =>
  useMemo(() => {
    const today = toDateStr(new Date());
    const recordedDates = new Set(meals.map((m) => m.eaten_at));
    const weekDays = lastNDays(7);
    const weekKeys = new Set(weekDays.map(toDateStr));

    const todayMeals = meals.filter((m) => m.eaten_at === today);
    const weekTotal = meals.filter((m) => weekKeys.has(m.eaten_at)).length;

    // 週間アクティビティ（過去7日・古い順）
    const weekly = weekDays.map((d) => {
      const key = toDateStr(d);
      return {
        key,
        weekday: WEEKDAY_LABELS[d.getDay()],
        count: meals.filter((m) => m.eaten_at === key).length,
        isToday: key === today,
      };
    });
    const weeklyMax = Math.max(1, ...weekly.map((w) => w.count));

    // 時間帯の割合
    const distribution = MEAL_TIME_ORDER.map((mt) => ({
      mealTime: mt,
      count: meals.filter((m) => m.meal_time === mt).length,
    }));

    // 今日の4スロット
    const todaySlots = MEAL_TIME_ORDER.map((mt) => ({
      mealTime: mt,
      meals: todayMeals
        .filter((m) => m.meal_time === mt)
        .sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    }));

    return {
      todayCount: todayMeals.length,
      streak: computeStreak(recordedDates),
      weekTotal,
      total: meals.length,
      weekly,
      weeklyMax,
      distribution,
      todaySlots,
      recent: meals.slice(0, 5),
    };
  }, [meals]);
