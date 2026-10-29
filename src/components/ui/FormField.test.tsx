import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, Input, Textarea, defaultSystem } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FormField } from "@/components/ui/FormField";

const renderWithChakra = (ui: ReactNode) =>
  render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);

describe("FormField", () => {
  it("ラベルを表示する", () => {
    renderWithChakra(
      <FormField label="メールアドレス">
        <Input />
      </FormField>,
    );
    expect(screen.getByText("メールアドレス")).toBeInTheDocument();
  });

  it("ラベルと Input が関連付けられる", () => {
    renderWithChakra(
      <FormField label="メールアドレス">
        <Input placeholder="example@email.com" />
      </FormField>,
    );
    expect(screen.getByLabelText("メールアドレス")).toBe(
      screen.getByPlaceholderText("example@email.com"),
    );
  });

  it("ラベルと Textarea が関連付けられる", () => {
    renderWithChakra(
      <FormField label="具体的な目標">
        <Textarea placeholder="例" />
      </FormField>,
    );
    expect(screen.getByLabelText("具体的な目標")).toBe(
      screen.getByPlaceholderText("例"),
    );
  });

  it("ラベルをクリックすると入力欄にフォーカスが移る", async () => {
    renderWithChakra(
      <FormField label="パスワード">
        <Input type="password" />
      </FormField>,
    );
    await userEvent.click(screen.getByText("パスワード"));
    expect(screen.getByLabelText("パスワード")).toHaveFocus();
  });

  it("入力欄に渡した required・minLength は Field に上書きされない", () => {
    renderWithChakra(
      <FormField label="パスワード">
        <Input type="password" required minLength={8} />
      </FormField>,
    );
    const input = screen.getByLabelText("パスワード");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("minLength", "8");
  });
});
