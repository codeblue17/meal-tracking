import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ChoiceButtonGroup } from "@/components/ui/ChoiceButtonGroup";

const OPTIONS = [
  { value: "a", label: "選択肢A" },
  { value: "b", label: "選択肢B" },
  { value: "c", label: "選択肢C" },
] as const;

type Value = (typeof OPTIONS)[number]["value"];

const renderGroup = (value: Value | "", onChange = vi.fn()) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <ChoiceButtonGroup options={OPTIONS} value={value} onChange={onChange} />
    </ChakraProvider>,
  );
  return onChange;
};

describe("ChoiceButtonGroup", () => {
  it("選択肢をすべてボタンとして表示する", () => {
    renderGroup("a");
    for (const { label } of OPTIONS) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("選択中のボタンだけ aria-pressed=true になる", () => {
    renderGroup("b");
    expect(screen.getByRole("button", { name: "選択肢A" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "選択肢B" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("未選択（空文字）のときはどれも選択されていない", () => {
    renderGroup("");
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("クリックするとその選択肢の value で onChange を呼ぶ", async () => {
    const onChange = renderGroup("a");
    await userEvent.click(screen.getByRole("button", { name: "選択肢C" }));
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("フォームを送信しない（type=button）", () => {
    renderGroup("a");
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});
