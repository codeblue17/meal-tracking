import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { DateField } from "@/components/ui/DateField";

// Popover の位置計算（floating-ui）が使う ResizeObserver は jsdom に無いため、何もしない実装を入れる
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

const renderDateField =(value: Date, onChange = vi.fn()) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <DateField value={value} onChange={onChange} />
    </ChakraProvider>,
  );
  return onChange;
};

// 日付を表示しているトリガーボタン
const trigger = () => screen.getByRole("button", { name: "2026年6月11日" });

describe("DateField", () => {
  it("選択中の日付を表示し、最初はカレンダーを閉じている", () => {
    renderDateField(new Date(2026, 5, 11));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("クリックするとカレンダーが開く", async () => {
    renderDateField(new Date(2026, 5, 11));
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("2026年6月")).toBeVisible();
  });

  it("日付を選ぶと onChange を呼び、カレンダーを閉じる", async () => {
    const onChange = renderDateField(new Date(2026, 5, 11));
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("button", { name: "20" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 20));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});
