import { describe, it, expect, vi } from "vitest";
import { notifyMealsChanged, subscribeMealsChanged } from "@/lib/mealEvents";

describe("mealEvents", () => {
  it("通知すると購読中のリスナーが呼ばれる", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeMealsChanged(listener);
    notifyMealsChanged();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("購読を解除すると呼ばれなくなる", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeMealsChanged(listener);
    unsubscribe();
    notifyMealsChanged();
    expect(listener).not.toHaveBeenCalled();
  });
});
