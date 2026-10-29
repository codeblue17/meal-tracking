import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ShareSection } from "@/components/profile/ShareSection";
import type { MealShare } from "@/types/mealShare";

const { useMealSharesMock, createShareMock, revokeShareMock } = vi.hoisted(
  () => ({
    useMealSharesMock: vi.fn(),
    createShareMock: vi.fn(),
    revokeShareMock: vi.fn(),
  }),
);

vi.mock("@/hooks/useMealShares", () => ({
  useMealShares: useMealSharesMock,
}));

const { toasterCreateMock } = vi.hoisted(() => ({
  toasterCreateMock: vi.fn(),
}));

vi.mock("@/components/ui/toaster-instance", () => ({
  toaster: { create: toasterCreateMock },
}));

// Popover（DateField）の位置計算が使う ResizeObserver は jsdom に無いため、何もしない実装を入れる
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

const makeShare = (overrides: Partial<MealShare> = {}): MealShare => ({
  id: "share-1",
  token: "token-1",
  label: "山田先生",
  start_date: "2026-10-01",
  end_date: null,
  expires_at: "2026-11-28T03:00:00.000Z",
  revoked_at: null,
  include_memo: true,
  include_images: false,
  created_at: "2026-10-29T03:00:00Z",
  ...overrides,
});

const mockHook = (overrides: Partial<ReturnType<typeof hookValue>> = {}) => {
  useMealSharesMock.mockReturnValue({ ...hookValue(), ...overrides });
};

const hookValue = () => ({
  shares: [] as MealShare[],
  loading: false,
  creating: false,
  revokingId: null as string | null,
  createShare: createShareMock,
  revokeShare: revokeShareMock,
});

const renderSection = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <ShareSection />
    </ChakraProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockHook();
  createShareMock.mockResolvedValue(makeShare());
  revokeShareMock.mockResolvedValue(true);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 29, 12, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("ShareSection - 発行", () => {
  it("「見せる食事記録」と「リンクの設定」に分けて、食事をした日の範囲であることを説明する", () => {
    renderSection();
    expect(screen.getByText("見せる食事記録")).toBeInTheDocument();
    expect(
      screen.getByText("食事をした日がこの範囲の記録を表示します"),
    ).toBeInTheDocument();
    expect(screen.getByText("いつの食事から")).toBeInTheDocument();
    expect(screen.getByText("いつの食事まで")).toBeInTheDocument();
    expect(screen.getByText("リンクの設定")).toBeInTheDocument();
    expect(screen.getByText("リンクを開ける期間")).toBeInTheDocument();
    expect(
      screen.getByText("過ぎるとリンクが開けなくなります"),
    ).toBeInTheDocument();
  });

  it("初期値（30日前の食事から継続・30日間・メモと写真は見せない）で発行する", async () => {
    renderSection();
    await userEvent.type(screen.getByLabelText("共有相手の名前"), "山田先生");
    await userEvent.click(
      screen.getByRole("button", { name: "共有リンクを発行する" }),
    );

    expect(createShareMock).toHaveBeenCalledWith({
      label: "山田先生",
      startDate: new Date(2026, 8, 29),
      endDate: null,
      expiry: "30",
      includeMemo: false,
      includeImages: false,
    });
  });

  it("選んだリンクを開ける期間・見せる内容で発行し、成功したら名前を空に戻す", async () => {
    renderSection();
    const labelInput = screen.getByLabelText("共有相手の名前");
    await userEvent.type(labelInput, "山田先生");
    await userEvent.click(screen.getByRole("button", { name: "90日間" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "メモ" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "写真" }));
    await userEvent.click(
      screen.getByRole("button", { name: "共有リンクを発行する" }),
    );

    expect(createShareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        expiry: "90",
        includeMemo: true,
        includeImages: true,
      }),
    );
    await waitFor(() => expect(labelInput).toHaveValue(""));
  });

  it("「いつの食事まで」で「日付を指定」を選ぶと日付の入力が出て、その日付で発行する", async () => {
    renderSection();
    // 初期値は継続。終わりの日付の入力は出ない
    expect(
      screen.getByText("これから記録する食事も表示されます"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "2026年10月29日" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "日付を指定" }));
    expect(
      screen.getByRole("button", { name: "2026年10月29日" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("これから記録する食事も表示されます"),
    ).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("共有相手の名前"), "山田先生");
    await userEvent.click(
      screen.getByRole("button", { name: "共有リンクを発行する" }),
    );

    // 終わりの日付の初期値は今日
    expect(createShareMock).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: new Date(2026, 9, 29) }),
    );
  });

  it("発行に失敗したら名前を残す", async () => {
    createShareMock.mockResolvedValue(null);
    renderSection();
    const labelInput = screen.getByLabelText("共有相手の名前");
    await userEvent.type(labelInput, "山田先生");
    await userEvent.click(
      screen.getByRole("button", { name: "共有リンクを発行する" }),
    );

    await waitFor(() => expect(createShareMock).toHaveBeenCalled());
    expect(labelInput).toHaveValue("山田先生");
  });
});

describe("ShareSection - 発行済みのリンク", () => {
  it("リンクが無ければその旨を表示する", () => {
    renderSection();
    expect(screen.getByText("有効な共有リンクはありません")).toBeInTheDocument();
  });

  it("共有相手・見せる記録・見せる内容・リンクを開ける期限を表示する", () => {
    mockHook({
      shares: [
        makeShare(),
        makeShare({
          id: "share-2",
          label: "佐藤先生",
          end_date: "2026-10-31",
          include_memo: false,
          include_images: true,
        }),
      ],
    });
    renderSection();

    expect(screen.getByText("山田先生")).toBeInTheDocument();
    expect(
      screen.getByText("見せる記録：2026年10月1日の食事から継続"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("見せる内容：食事名・時間帯・メモ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("見せる記録：2026年10月1日〜2026年10月31日の食事"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("見せる内容：食事名・時間帯・写真"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("リンクを開ける期限：2026年11月28日まで"),
    ).toHaveLength(2);
  });

  it("「リンクをコピー」で共有 URL をクリップボードに書き込む", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    mockHook({ shares: [makeShare()] });
    renderSection();

    await user.click(screen.getByRole("button", { name: "リンクをコピー" }));

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/share/token-1`,
    );
    expect(toasterCreateMock).toHaveBeenCalledWith({
      title: "リンクをコピーしました",
      type: "success",
    });
  });

  it("Web Share API が使える環境だけ「送る」を表示し、共有 URL を渡す", async () => {
    mockHook({ shares: [makeShare()] });
    const { unmount } = renderSection();
    expect(screen.queryByRole("button", { name: "送る" })).not.toBeInTheDocument();
    unmount();

    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share });
    renderSection();
    await userEvent.click(screen.getByRole("button", { name: "送る" }));

    expect(share).toHaveBeenCalledWith({
      title: "食事記録の共有",
      url: `${window.location.origin}/share/token-1`,
    });
  });

  it("「無効化」で確認ダイアログを出し、「無効化する」でそのリンクを無効化する", async () => {
    mockHook({ shares: [makeShare()] });
    renderSection();

    await userEvent.click(screen.getByRole("button", { name: "無効化" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByText(/「山田先生」に渡したリンク/),
    ).toBeInTheDocument();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "無効化する" }),
    );
    expect(revokeShareMock).toHaveBeenCalledWith("share-1");
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  });

  it("確認ダイアログで「キャンセル」すると無効化しない", async () => {
    mockHook({ shares: [makeShare()] });
    renderSection();

    await userEvent.click(screen.getByRole("button", { name: "無効化" }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "キャンセル" }),
    );

    expect(revokeShareMock).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  });
});
