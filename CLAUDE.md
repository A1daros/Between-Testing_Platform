# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (type-check is part of the build)
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — serve the production build

There is no test runner configured.

Required env vars (`.env` / `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Architecture

BETWEEN — an English-school site and CEFR (A1–B2) testing platform. React 19 + TypeScript + Vite SPA, SCSS Modules, React Router v7, deployed on Vercel (`vercel.json` rewrites everything to `index.html`). The backend is entirely Supabase (Postgres + Auth + Storage + RLS); there is no custom server.

- **Entry / routing**: `src/main.tsx` wraps `App` in `AuthProvider`. `src/App.tsx` declares all routes using the `ROUTES` constants in `src/constants/routes.ts` (admin sub-routes are in `ADMIN_ROUTES`, relative to `/admin/*`). Public routes: home, about, placement test, auth pages. Everything else sits under `routes/ProtectedRoute`, and admin is additionally under `routes/AdminRoute`. The admin module is lazy-loaded and wrapped in an `ErrorBoundary` (`ChunkError`) + `Suspense`.
- **Auth**: `context/AuthProvider.tsx` holds Supabase session, user and the `profiles` row (which carries the role used for admin checks); consume through `hooks/useAuth.ts`.
- **Data access**: all Supabase queries live in `src/services/*.ts` (one file per domain: tests, questions, answers, results, resultAnswers, profile, programs, teachers, levels, …), using the single client from `src/lib/supabase.ts`. Components/hooks call services rather than the client directly. DB row types are in `src/types/database.ts`.
- **Server-side logic**: the placement-test level is computed by the Postgres RPC `calculate_placement_level` (called from `services/placement.ts`). Anonymous placement results are not persisted. Authorization is enforced by RLS, not only in the UI. The only edge function is `supabase/functions/send-contact-email` (Deno; the `.vscode` settings enable Deno only for that path).
- **Content model**: levels → submodules → tests (`placement_test` / `submodule_quiz` / `final_test`) → test_parts → questions → answers. Results are `results` + `result_answers`. Landing-page programs/formats and teachers are loaded from Supabase (see `services/programs.ts`, `services/teachers.ts`); static fallback/marketing content is in `src/data`.
- **UI modules**: `src/modules/<feature>/` (home, tests, quiz, results, profile, authentication, admin, about-school, shared) each with co-located `.module.scss`. Shared layout lives in `modules/shared/components/Layuot` (note the existing "Layuot" spelling in the path). Quiz state/timer logic is in `hooks/useQuiz.ts` and `hooks/useCountdown.ts`. Shared SCSS variables/mixins are in `src/styles`.

## Notes

- The site language is Ukrainian (`<html lang="uk">`); recent commits adjusted language handling for public vs. protected routes.
- `public/sitemap.xml` is maintained by hand; update it when adding public routes.
- `dist/` is git-ignored build output; don't edit it.
