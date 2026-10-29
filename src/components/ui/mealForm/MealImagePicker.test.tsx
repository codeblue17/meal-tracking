import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MealImagePicker } from "@/components/ui/mealForm/MealImagePicker";

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

const renderPicker = (previewUrl: string | null = null) => {
  const onSelect = vi.fn();
  const onRemove = vi.fn();
  const { container } = render(
    <ChakraProvider value={defaultSystem}>
      <MealImagePicker
        previewUrl={previewUrl}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </ChakraProvider>,
  );
  const fileInput = container.querySelector<HTMLInputElement>(
    'input[type="file"]',
  )!;
  return { onSelect, onRemove, fileInput };
};

const makeFile = (name: string, type: string, size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MealImagePicker", () => {
  it("画像が無いときは追加の案内を表示する", () => {
    renderPicker();
    expect(screen.getByText("タップして写真を追加")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "写真を削除" })).toBeNull();
  });

  it("画像があるときはプレビューと削除ボタンを表示する", () => {
    const { container } = render(
      <ChakraProvider value={defaultSystem}>
        <MealImagePicker
          previewUrl="https://example.com/a.jpg"
          onSelect={vi.fn()}
          onRemove={vi.fn()}
        />
      </ChakraProvider>,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/a.jpg",
    );
    expect(
      screen.getByRole("button", { name: "写真を削除" }),
    ).toBeInTheDocument();
  });

  it("画像ファイルを選ぶと onSelect にそのファイルを渡す", async () => {
    const { onSelect, fileInput } = renderPicker();
    const file = makeFile("meal.png", "image/png");
    await userEvent.upload(fileInput, file);

    expect(onSelect).toHaveBeenCalledWith(file);
    expect(toasterCreateMock).not.toHaveBeenCalled();
  });

  it("画像以外のファイルはエラーになり onSelect を呼ばない", async () => {
    const { onSelect, fileInput } = renderPicker();
    // accept="image/*" による絞り込みを無効にして、画像以外を選んだ状況を再現する
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(fileInput, makeFile("memo.txt", "text/plain"));

    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "画像ファイルを選択してください",
      type: "error",
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("10MB を超える画像はエラーになり onSelect を呼ばない", async () => {
    const { onSelect, fileInput } = renderPicker();
    await userEvent.upload(
      fileInput,
      makeFile("big.jpg", "image/jpeg", 10 * 1024 * 1024 + 1),
    );

    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "画像サイズは10MB以内にしてください",
      type: "error",
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("削除ボタンで onRemove を呼び、ファイル選択は開かない", async () => {
    const { onRemove, fileInput } = renderPicker("https://example.com/a.jpg");
    const clickSpy = vi.spyOn(fileInput, "click");
    await userEvent.click(screen.getByRole("button", { name: "写真を削除" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
