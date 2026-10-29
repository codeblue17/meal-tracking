import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MealGroupList } from "@/components/list/MealGroupList";
import type { DateGroup } from "@/components/list/MealGroupList";

vi.mock("@/lib/supabase", () => ({ supabase: null }));

// 共有ページの食事と同じく user_id / created_at を持たないデータ
const GROUPS: DateGroup[] = [
  {
    date: "2026-10-05",
    meals: [
      {
        id: "meal-1",
        name: "焼き魚定食",
        meal_time: "dinner",
        eaten_at: "2026-10-05",
        memo: "ご飯少なめ",
        image_path: null,
      },
    ],
  },
  {
    date: "2026-10-01",
    meals: [
      {
        id: "meal-2",
        name: "トースト",
        meal_time: "breakfast",
        eaten_at: "2026-10-01",
        memo: null,
        image_path: null,
      },
    ],
  },
];

type Props = Parameters<typeof MealGroupList>[0];

const renderList = (props: Partial<Props> = {}) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <MealGroupList groups={GROUPS} onPreviewImage={vi.fn()} {...props} />
    </ChakraProvider>,
  );

describe("MealGroupList", () => {
  it("日付ごとに食事名・時間帯・メモを表示する", () => {
    renderList();
    expect(screen.getByText("焼き魚定食")).toBeInTheDocument();
    expect(screen.getByText("トースト")).toBeInTheDocument();
    expect(screen.getByText("夕食")).toBeInTheDocument();
    expect(screen.getByText("朝食")).toBeInTheDocument();
    expect(screen.getByText("ご飯少なめ")).toBeInTheDocument();
  });

  it("onEdit / onDelete を渡すと編集・削除ボタンを表示し、食事の ID で呼ぶ", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderList({ onEdit, onDelete });

    const editButtons = screen.getAllByRole("button", { name: "編集" });
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);

    await userEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith("meal-1");
    await userEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith("meal-2");
  });

  it("onEdit / onDelete を省略すると編集・削除ボタンを表示しない（読み取り専用）", () => {
    renderList();
    expect(
      screen.queryByRole("button", { name: "編集" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "削除" }),
    ).not.toBeInTheDocument();
  });

  it("onDelete だけを渡すと削除ボタンだけを表示する", () => {
    renderList({ onDelete: vi.fn() });
    expect(
      screen.queryByRole("button", { name: "編集" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "削除" })).toHaveLength(2);
  });
});
