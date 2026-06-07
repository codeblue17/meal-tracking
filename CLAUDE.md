# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000 (opens browser automatically)
npm run build    # Type-check then build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

No test suite is configured yet.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Chakra UI v3 + React Router v7

**Entry point:** `src/main.tsx` wraps the app in `BrowserRouter` → `Provider` (Chakra UI + color mode).

**Routing — two-level structure:**
- `src/router/Router.tsx`: top-level. `/` → Login page. `/*` → `HomeRouter`. Catches 404.
- `src/router/HomeRouter.tsx`: authenticated area. Renders `<Header>` persistently, then nested routes (`/dashboard`, `/list`, `/profile`).

Authentication guard is not yet implemented — `HomeRouter` is reachable without logging in.

**Path alias:** `@/` maps to `src/` (configured via `tsconfigPaths` in Vite and `tsconfig.app.json`).

**Chakra UI v3 notes:**
- Uses `defaultSystem` (not a custom theme). Color mode is managed via `next-themes` through the generated `color-mode.tsx` wrapper.
- `variant="filled"` on `Input` does not exist in v3; use `"outline"`, `"subtle"`, or `"flushed"`.
- Use `colorPalette` prop (not `colorScheme`) on buttons and interactive elements.

**Shared UI components** live in `src/components/ui/`:
- `LogoIcon.tsx` — the "食" circle logo, spreads `FlexProps` so callers control size/color/shadow.
- `layout/Header.tsx` — sticky nav with desktop links + mobile Drawer.
- Generated Chakra snippets: `provider.tsx`, `color-mode.tsx`, `toaster.tsx`, `tooltip.tsx`.

**Pages** are in `src/pages/`. Each page component is a named export wrapped in `memo`.
