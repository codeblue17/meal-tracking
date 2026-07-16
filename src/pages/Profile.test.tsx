import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Profile } from "./Profile";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";
import type { User } from "@supabase/supabase-js";

const { updateUserMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { updateUser: updateUserMock },
  },
}));

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

const renderProfile = (user: Partial<User> = { id: "user-1" }) => {
  const authValue: AuthContextType = {
    user: user as User,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  return render(
    <ChakraProvider value={defaultSystem}>
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </AuthContext.Provider>
    </ChakraProvider>,
  );
};

beforeEach(() => {
  updateUserMock.mockReset();
  updateUserMock.mockResolvedValue({ error: null });
  toasterCreateMock.mockReset();
});

describe("Profile - 表示名バリデーション", () => {
  it("20文字以内なら保存できる", async () => {
    renderProfile();
    const input = screen.getByPlaceholderText("表示名を入力");
    fireEvent.change(input, { target: { value: "あ".repeat(20) } });

    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({
        data: { full_name: "あ".repeat(20) },
      });
    });
    expect(toasterCreateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("21文字以上（maxLength回避時）はエラーになり保存されない", async () => {
    renderProfile();
    const input = screen.getByPlaceholderText("表示名を入力");
    // maxLength属性を回避した入力（DevTools操作等を想定）
    fireEvent.change(input, { target: { value: "あ".repeat(21) } });

    await userEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "表示名は20文字以内で入力してください",
        type: "error",
      });
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("Input要素にmaxLength=20が設定されている", () => {
    renderProfile();
    const input = screen.getByPlaceholderText("表示名を入力");
    expect(input).toHaveAttribute("maxLength", "20");
  });
});

describe("Profile - 目標詳細バリデーション", () => {
  it("200文字以内なら保存できる", async () => {
    renderProfile();
    await userEvent.click(screen.getByRole("button", { name: "減量" }));
    const textarea = screen.getByPlaceholderText(
      "例: 3ヶ月で体重を3kg減らす（任意）",
    );
    fireEvent.change(textarea, { target: { value: "a".repeat(200) } });

    await userEvent.click(
      screen.getByRole("button", { name: "目標を保存する" }),
    );

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({
        data: { goal_type: "weight_loss", goal_detail: "a".repeat(200) },
      });
    });
  });

  it("201文字以上（maxLength回避時）はエラーになり保存されない", async () => {
    renderProfile();
    await userEvent.click(screen.getByRole("button", { name: "減量" }));
    const textarea = screen.getByPlaceholderText(
      "例: 3ヶ月で体重を3kg減らす（任意）",
    );
    fireEvent.change(textarea, { target: { value: "a".repeat(201) } });

    await userEvent.click(
      screen.getByRole("button", { name: "目標を保存する" }),
    );

    await waitFor(() => {
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "具体的な目標は200文字以内で入力してください",
        type: "error",
      });
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("Textarea要素にmaxLength=200が設定されている", () => {
    renderProfile();
    const textarea = screen.getByPlaceholderText(
      "例: 3ヶ月で体重を3kg減らす（任意）",
    );
    expect(textarea).toHaveAttribute("maxLength", "200");
  });
});
