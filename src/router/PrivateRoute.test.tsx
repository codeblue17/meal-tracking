import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { PrivateRoute } from "./PrivateRoute";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";

const renderWithAuth = (value: Partial<AuthContextType>, path = "/protected") => {
  const defaults: AuthContextType = {
    user: null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };

  return render(
    <ChakraProvider value={defaultSystem}>
      <AuthContext.Provider value={{ ...defaults, ...value }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/" element={<p>ログインページ</p>} />
            <Route
              path="/protected"
              element={
                <PrivateRoute>
                  <p>保護されたコンテンツ</p>
                </PrivateRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ChakraProvider>
  );
};

describe("PrivateRoute", () => {
  it("ローディング中は保護コンテンツもリダイレクトも発生しない", () => {
    renderWithAuth({ loading: true, user: null });
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
    expect(screen.queryByText("ログインページ")).not.toBeInTheDocument();
  });

  it("未認証の場合はログインページへリダイレクトする", () => {
    renderWithAuth({ loading: false, user: null });
    expect(screen.getByText("ログインページ")).toBeInTheDocument();
    expect(screen.queryByText("保護されたコンテンツ")).not.toBeInTheDocument();
  });

  it("認証済みの場合は子コンポーネントを表示する", () => {
    renderWithAuth({ loading: false, user: { id: "user-1" } as never });
    expect(screen.getByText("保護されたコンテンツ")).toBeInTheDocument();
  });
});
