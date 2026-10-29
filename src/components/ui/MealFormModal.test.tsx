import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MealFormModal } from "@/components/ui/MealFormModal";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";
import type { User } from "@supabase/supabase-js";

const { insertMock, fromMock } = vi.hoisted(() => {
  const insertMock = vi.fn();
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  return { insertMock, fromMock };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

const renderModal = (onClose = vi.fn()) => {
  const authValue: AuthContextType = {
    user: { id: "user-1" } as User,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  return render(
    <ChakraProvider value={defaultSystem}>
      <AuthContext.Provider value={authValue}>
        <MealFormModal open onClose={onClose} />
      </AuthContext.Provider>
    </ChakraProvider>,
  );
};

beforeEach(() => {
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  fromMock.mockClear();
  toasterCreateMock.mockReset();
});

const submitForm = async () => {
  const submitButton = screen.getByRole("button", { name: "記録する" });
  await userEvent.click(submitButton);
};

describe("MealFormModal - 食事名バリデーション", () => {
  it("スペースのみの入力（required属性を回避）はエラーになり保存されない", async () => {
    renderModal();
    const input = screen.getByPlaceholderText("例: 鶏むね肉の定食");
    fireEvent.change(input, { target: { value: "   " } });
    await submitForm();

    await waitFor(() => {
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "食事名を入力してください",
        type: "error",
      });
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("100文字以内なら保存できる", async () => {
    renderModal();
    const input = screen.getByPlaceholderText("例: 鶏むね肉の定食");
    fireEvent.change(input, { target: { value: "a".repeat(100) } });
    await submitForm();

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "a".repeat(100) }),
      );
    });
  });

  it("101文字以上（maxLength回避時）はエラーになり保存されない", async () => {
    renderModal();
    const input = screen.getByPlaceholderText("例: 鶏むね肉の定食");
    fireEvent.change(input, { target: { value: "a".repeat(101) } });
    await submitForm();

    await waitFor(() => {
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "食事名は100文字以内で入力してください",
        type: "error",
      });
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("Input要素にmaxLength=100が設定されている", () => {
    renderModal();
    const input = screen.getByPlaceholderText("例: 鶏むね肉の定食");
    expect(input).toHaveAttribute("maxLength", "100");
  });
});

describe("MealFormModal - メモバリデーション", () => {
  const fillRequiredName = () => {
    const input = screen.getByPlaceholderText("例: 鶏むね肉の定食");
    fireEvent.change(input, { target: { value: "鶏むね肉の定食" } });
  };

  it("500文字以内なら保存できる", async () => {
    renderModal();
    fillRequiredName();
    const textarea = screen.getByPlaceholderText("食材・気づきなど（任意）");
    fireEvent.change(textarea, { target: { value: "a".repeat(500) } });
    await submitForm();

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ memo: "a".repeat(500) }),
      );
    });
  });

  it("501文字以上（maxLength回避時）はエラーになり保存されない", async () => {
    renderModal();
    fillRequiredName();
    const textarea = screen.getByPlaceholderText("食材・気づきなど（任意）");
    fireEvent.change(textarea, { target: { value: "a".repeat(501) } });
    await submitForm();

    await waitFor(() => {
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "メモは500文字以内で入力してください",
        type: "error",
      });
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("Textarea要素にmaxLength=500が設定されている", () => {
    renderModal();
    const textarea = screen.getByPlaceholderText("食材・気づきなど（任意）");
    expect(textarea).toHaveAttribute("maxLength", "500");
  });
});

describe("MealFormModal - 写真プレビューの blob URL", () => {
  let urlCount = 0;
  const createObjectURLMock = vi.fn(() => `blob:mock-${++urlCount}`);
  const revokeObjectURLMock = vi.fn();

  // jsdom には URL.createObjectURL / revokeObjectURL が無いため、テスト中だけ差し込む
  beforeEach(() => {
    urlCount = 0;
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();
    URL.createObjectURL = createObjectURLMock;
    URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterEach(() => {
    Reflect.deleteProperty(URL, "createObjectURL");
    Reflect.deleteProperty(URL, "revokeObjectURL");
  });

  const selectImage = (name: string) =>
    userEvent.upload(
      screen.getByLabelText("写真"),
      new File(["x"], name, { type: "image/png" }),
    );

  it("写真を差し替えると、前の blob URL を解放する", async () => {
    renderModal();
    await selectImage("a.png");
    await selectImage("b.png");

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-1");
    expect(revokeObjectURLMock).not.toHaveBeenCalledWith("blob:mock-2");
  });

  it("写真を削除すると、その blob URL を解放する", async () => {
    renderModal();
    await selectImage("a.png");
    await userEvent.click(screen.getByRole("button", { name: "写真を削除" }));

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-1");
  });

  it("フォームを閉じると、表示中の blob URL を解放する", async () => {
    const { unmount } = renderModal();
    await selectImage("a.png");
    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    unmount();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-1");
  });
});
