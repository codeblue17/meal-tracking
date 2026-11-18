import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Profile } from "@/pages/Profile";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";
import type { User } from "@supabase/supabase-js";

const { updateUserMock, fromMock } = vi.hoisted(() => {
  // 共有リンクの取得（supabase.from("meal_shares").select()...order()）は空の一覧を返す
  const chain = {
    select: () => chain,
    eq: () => chain,
    is: () => chain,
    gt: () => chain,
    order: () => chain,
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(resolve),
  };
  return { updateUserMock: vi.fn(), fromMock: vi.fn(() => chain) };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { updateUser: updateUserMock },
    from: fromMock,
  },
}));

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

const renderProfile = (
  user: Partial<User> = { id: "user-1" },
  initialPath = "/profile",
) => {
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
        <MemoryRouter initialEntries={[initialPath]}>
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
  fromMock.mockClear();
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

describe("Profile - タブ", () => {
  it("初期表示はプロフィールタブで、共有・アカウントの内容は表示されない", () => {
    renderProfile();
    expect(screen.getByRole("tab", { name: "プロフィール" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("表示名")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "サインアウト" }),
    ).not.toBeInTheDocument();
    // 共有タブを開くまで共有リンクは取得しない
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("タブを切り替えると対応する内容が表示される", async () => {
    renderProfile();
    await userEvent.click(screen.getByRole("tab", { name: "アカウント" }));

    expect(
      await screen.findByRole("button", { name: "サインアウト" }),
    ).toBeVisible();
    expect(screen.getByText("登録日")).toBeVisible();
  });

  it("?tab=share で共有リンクタブが開く", async () => {
    renderProfile({ id: "user-1" }, "/profile?tab=share");
    expect(screen.getByRole("tab", { name: "共有リンク" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await waitFor(() => expect(fromMock).toHaveBeenCalledWith("meal_shares"));
  });

  it("不正な ?tab= はプロフィールタブを開く", () => {
    renderProfile({ id: "user-1" }, "/profile?tab=unknown");
    expect(screen.getByRole("tab", { name: "プロフィール" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
