import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { PasswordSection } from "./PasswordSection";

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

const renderPasswordSection = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <PasswordSection />
    </ChakraProvider>,
  );

const fillAndSubmit = async (newPassword: string, confirmPassword: string) => {
  if (newPassword) {
    await userEvent.type(screen.getByLabelText("新しいパスワード"), newPassword);
  }
  if (confirmPassword) {
    await userEvent.type(
      screen.getByLabelText("確認用パスワード"),
      confirmPassword,
    );
  }
  await userEvent.click(
    screen.getByRole("button", { name: "パスワードを変更する" }),
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  updateUserMock.mockResolvedValue({ error: null });
});

describe("PasswordSection - パスワード変更", () => {
  it("8文字以上で一致していれば変更し、入力欄を空にする", async () => {
    renderPasswordSection();
    await fillAndSubmit("abcd1234", "abcd1234");

    await waitFor(() =>
      expect(updateUserMock).toHaveBeenCalledWith({ password: "abcd1234" }),
    );
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "パスワードを変更しました",
      type: "success",
    });
    expect(screen.getByLabelText("新しいパスワード")).toHaveValue("");
    expect(screen.getByLabelText("確認用パスワード")).toHaveValue("");
  });

  it("7文字以下はエラーになり変更されない", async () => {
    renderPasswordSection();
    await fillAndSubmit("abc1234", "abc1234");

    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "パスワードは8文字以上で入力してください",
      type: "error",
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("未入力のままではエラーになり変更されない", async () => {
    renderPasswordSection();
    await fillAndSubmit("", "");

    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "パスワードは8文字以上で入力してください",
      type: "error",
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("確認用と一致しなければエラーになり変更されない", async () => {
    renderPasswordSection();
    await fillAndSubmit("abcd1234", "abcd9999");

    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "パスワードが一致しません",
      type: "error",
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("Supabase がエラーを返したら失敗トーストを出し、入力は残す", async () => {
    updateUserMock.mockResolvedValue({ error: new Error("boom") });
    renderPasswordSection();
    await fillAndSubmit("abcd1234", "abcd1234");

    await waitFor(() =>
      expect(toasterCreateMock).toHaveBeenCalledWith({
        title: "パスワードの変更に失敗しました",
        type: "error",
      }),
    );
    expect(screen.getByLabelText("新しいパスワード")).toHaveValue("abcd1234");
  });
});
