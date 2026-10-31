import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Router } from "@/router/Router";
import { AuthContext } from "@/hooks/useAuth";
import type { AuthContextType } from "@/hooks/useAuth";

vi.mock("@/lib/supabase", () => ({ supabase: null }));

vi.mock("@/hooks/useSharedMeals", () => ({
  useSharedMeals: () => ({
    result: { status: "expired" },
    loading: false,
    error: false,
  }),
}));

describe("Router", () => {
  it("ログインしていなくても共有ページ（/share/:token）を開ける", () => {
    const authValue: AuthContextType = {
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    };
    render(
      <ChakraProvider value={defaultSystem}>
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={["/share/token-1"]}>
            <Router />
          </MemoryRouter>
        </AuthContext.Provider>
      </ChakraProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "このリンクは有効期限が切れています" }),
    ).toBeInTheDocument();
  });
});
