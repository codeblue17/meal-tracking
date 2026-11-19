import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MonthFilter } from "@/components/list/MonthFilter";

const renderFilter = (value: string, onChange = vi.fn()) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <MonthFilter value={value} onChange={onChange} />
    </ChakraProvider>,
  );
  return onChange;
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 19));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MonthFilter", () => {
  it("未指定時は「月で絞り込む」だけを出し、押すと今月を選ぶ", async () => {
    const onChange = renderFilter("");
    expect(
      screen.queryByRole("button", { name: "前の月" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "月で絞り込む" }));
    expect(onChange).toHaveBeenCalledWith("2026-11");
  });

  it("「クリア」で絞り込みを解除する", async () => {
    const onChange = renderFilter("2026-08");
    await userEvent.click(screen.getByRole("button", { name: "クリア" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("表示月を「YYYY年M月」で表示する", () => {
    renderFilter("2026-11");
    expect(screen.getByText("2026年11月")).toBeInTheDocument();
  });

  it("前の月・次の月ボタンで月を移動する（年またぎ含む）", async () => {
    const onChange = renderFilter("2026-01");
    await userEvent.click(screen.getByRole("button", { name: "前の月" }));
    expect(onChange).toHaveBeenLastCalledWith("2025-12");
    await userEvent.click(screen.getByRole("button", { name: "次の月" }));
    expect(onChange).toHaveBeenLastCalledWith("2026-02");
  });

  it("今月を表示中は「今月」ボタンを出さない", () => {
    renderFilter("2026-11");
    expect(
      screen.queryByRole("button", { name: "今月" }),
    ).not.toBeInTheDocument();
  });

  it("今月以外を表示中は「今月」ボタンで今月に戻る", async () => {
    const onChange = renderFilter("2026-08");
    await userEvent.click(screen.getByRole("button", { name: "今月" }));
    expect(onChange).toHaveBeenCalledWith("2026-11");
  });
});
