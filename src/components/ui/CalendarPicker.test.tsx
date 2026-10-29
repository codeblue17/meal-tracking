import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { CalendarPicker } from "@/components/ui/CalendarPicker";

const renderCalendar = (value: Date, onChange = vi.fn()) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <CalendarPicker value={value} onChange={onChange} />
    </ChakraProvider>,
  );
  return onChange;
};

const dayButtons = () =>
  screen
    .getAllByRole("button")
    .filter((b) => /^\d+$/.test(b.textContent ?? ""));

describe("CalendarPicker", () => {
  it("選択中の日付の年月を表示する", () => {
    renderCalendar(new Date(2026, 5, 11));
    expect(screen.getByText("2026年6月")).toBeInTheDocument();
  });

  it("その月の日数ぶんの日付ボタンを表示する", () => {
    renderCalendar(new Date(2026, 1, 10)); // 2026年2月は28日まで
    expect(dayButtons()).toHaveLength(28);
  });

  it("日付をクリックすると、その日の Date で onChange を呼ぶ", async () => {
    const onChange = renderCalendar(new Date(2026, 5, 11));
    await userEvent.click(screen.getByRole("button", { name: "20" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 5, 20));
  });

  it("前の月・次の月へ移動できる", async () => {
    renderCalendar(new Date(2026, 5, 11));
    await userEvent.click(screen.getByRole("button", { name: "次の月" }));
    expect(screen.getByText("2026年7月")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "前の月" }));
    await userEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年5月")).toBeInTheDocument();
  });

  it("12月の次は翌年1月、1月の前は前年12月になる", async () => {
    renderCalendar(new Date(2026, 11, 31));
    await userEvent.click(screen.getByRole("button", { name: "次の月" }));
    expect(screen.getByText("2027年1月")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "前の月" }));
    await userEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(screen.getByText("2026年11月")).toBeInTheDocument();
  });

  it("移動先の月で日付を選ぶと、その月の Date で onChange を呼ぶ", async () => {
    const onChange = renderCalendar(new Date(2026, 11, 31));
    await userEvent.click(screen.getByRole("button", { name: "次の月" }));
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onChange).toHaveBeenCalledWith(new Date(2027, 0, 5));
  });
});
