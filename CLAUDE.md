# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Start dev server at localhost:3000 (opens browser automatically)
npm run build       # Type-check then build for production
npm run lint        # Run ESLint
npm run preview     # Preview production build
npm test            # Run all tests once (Vitest)
npm run test:watch  # Run tests in watch mode
npx vitest run src/hooks/useMeals.test.tsx  # Run a single test file
```

Before finishing a change, run `npm test`, `npm run lint`, and `npx tsc -b`.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Chakra UI v3 + React Router v7, with Supabase (Auth / Postgres / Storage) as the backend.

**Entry point:** `src/main.tsx` wraps the app in `BrowserRouter` → `Provider` (Chakra UI + color mode) → `AuthProvider` → `App` + `Toaster`.

**Routing — two-level structure:**
- `src/router/Router.tsx`: top-level. `/` → Login, `/signup` → Signup. `/*` → `HomeRouter` wrapped in `PrivateRoute`. Catches 404.
- `src/router/PrivateRoute.tsx`: shows a spinner while auth is loading, redirects to `/` when there is no user.
- `src/router/HomeRouter.tsx`: authenticated area. Renders `<Header>` persistently, then nested routes (`/dashboard`, `/list`, `/profile`).

**Path alias:** `@/` maps to `src/` (configured via `tsconfigPaths` in Vite and `tsconfig.app.json`). Use `@/` for every import — including same-folder files, tests importing the file under test, and CSS — never relative `./` or `../` paths.

### Supabase

- Client is created in `src/lib/supabase.ts` from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (`.env`). When they are not set, `supabase` is `null`, so data-access code starts with `if (!supabase) return`.
- Schema lives in `supabase/migrations/` (`meals` table, `meal-images` storage bucket, `delete_user()` RPC used for account deletion). See README for setup and DB reset.
- Auth state: `AuthProvider` (`src/contexts/AuthContext.tsx`) subscribes to `onAuthStateChange`; read it with `useAuth()` (`src/hooks/useAuth.ts`) → `{ user, session, loading, signIn, signUp, signOut }`. Profile data (display name, goals) is stored in `user.user_metadata` (`full_name`, `goal_type`, `goal_detail`).
- Meal images: helpers in `src/utils/imageUpload.ts` (`uploadMealImage`, `deleteMealImage`, `getMealImageUrl`).

### Directory layout

- `src/pages/` — one file per route. Pages compose section components and own only page-level state (modals, filters, pagination). Each page is a named export wrapped in `memo`.
- `src/components/<page>/` — components used by a single page (`dashboard/`, `list/`, `profile/`).
- `src/components/ui/` — shared components:
  - `FormField.tsx` — label + input pair built on Chakra `Field`; the label is linked to the `Input` / `Textarea` inside it. Use it for every labeled form control.
  - `MealFormModal.tsx` — add/edit meal dialog (used by Dashboard and List). Its parts live in `mealForm/`.
  - `CalendarPicker.tsx` — month calendar for picking a date (`value` / `onChange`).
  - `ChoiceButtonGroup.tsx` — row of buttons for picking one option (`options` / `value` / `onChange`, generic over the value type; `""` = nothing selected). Used for meal time and goal type.
  - `DateField.tsx` — date input: a button showing the date that opens `CalendarPicker` in a Popover (owns its open state).
  - `Pagination.tsx`, `PrimaryButton.tsx`, `MealThumbnail.tsx`, `ImageLightbox.tsx`, `LogoIcon.tsx`.
  - `layout/Header.tsx` (sticky nav + mobile Drawer), `layout/AuthLayout.tsx` (Login/Signup frame).
  - `toaster-instance.ts` — import `toaster` from here (not from `toaster.tsx`) to show toasts.
  - Generated Chakra snippets: `provider.tsx`, `color-mode.tsx`, `toaster.tsx`, `tooltip.tsx`.
- `src/hooks/` — `useAuth`, `useMeals` (fetches the user's meals, returns `{ meals, setMeals, loading, refresh }`), `useDashboardStats` (pure aggregation for the dashboard).
- `src/constants/` — `mealTime.ts` (`MEAL_TIME_META` labels/colors/order and `MEAL_TIME_ORDER`; derive meal-time lists from these instead of hard-coding), `auth.ts` (`PASSWORD_MIN_LENGTH`, shared by signup and password change), `date.ts` (`WEEKDAY_LABELS`, indexed by `Date#getDay()`).
- `src/styles/` — shared style objects (`inputStyle` for form inputs, `cardStyle` for dashboard cards).
- `src/utils/dateUtils.ts` — `toDateStr` (local `YYYY-MM-DD`; `meals.eaten_at` uses this format and is compared as a string), display formatters.

### Component conventions

- Props are plain values (`fullName`, `email`, `createdAt`), not the Supabase `User` object; the page extracts them from `user`.
- A section that edits data owns its own form state and save handler (e.g. `ProfileEditSection`, `GoalSection`, `PasswordSection`); the page passes only initial values.
- Callbacks passed to `memo` components are wrapped in `useCallback` in the parent.
- Non-component exports from a component file are limited to types (e.g. `GoalType`, `DateGroup`).

### Chakra UI v3 notes

- Uses `defaultSystem` (not a custom theme). Color mode is managed via `next-themes` through the generated `color-mode.tsx` wrapper.
- `variant="filled"` on `Input` does not exist in v3; use `"outline"`, `"subtle"`, or `"flushed"`.
- Use `colorPalette` prop (not `colorScheme`) on buttons and interactive elements.

## Testing

Vitest + Testing Library on jsdom (`src/test/setup.ts` loads `jest-dom`). Tests sit next to the file they cover (`*.test.ts(x)`).

- Mock Supabase and the toaster with `vi.hoisted` + `vi.mock("@/lib/supabase", ...)` / `vi.mock("@/components/ui/toaster-instance", ...)` (see `src/pages/Profile.test.tsx`, `src/hooks/useMeals.test.tsx`).
- Wrap rendered components in `<ChakraProvider value={defaultSystem}>`; provide auth with `<AuthContext.Provider value={...}>`.
- For date-dependent logic, fix the clock with `vi.useFakeTimers({ toFake: ["Date"] })` + `vi.setSystemTime(...)` (see `src/hooks/useDashboardStats.test.ts`).
- jsdom has no `ResizeObserver`; tests that open a Chakra Popover must stub it (see `src/components/ui/DateField.test.tsx`).
- Prefer querying form controls by label (`getByLabelText`) now that labels are linked via `FormField`.

## Known limitations

- `useMeals` fetches all of the user's meals with no paging; Supabase caps a single select at 1000 rows by default, so totals on Dashboard/List become inaccurate past that.
