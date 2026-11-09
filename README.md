# BETWEEN — English Testing Platform

Website of the BETWEEN English school and a testing platform for CEFR levels A1–B2.
It reduces the time teachers spend checking tests by hand.

🔗 **Demo:** [between-testing-platform.vercel.app](https://between-testing-platform.vercel.app/)

**Status:** works in production on Vercel, not publicly launched yet. Indexing is off,
there is no custom domain, and data in the cloud is test data.

This README is the starting point for returning to the project after a long break.
Project conventions and the full launch checklist are in [CLAUDE.md](CLAUDE.md).

## 🚀 Main features

**For students**

- **Registration with approval** — the student confirms their email, then the admin approves
  the account and opens access to tests
- **Placement test** — free test without registration that determines the level on the server;
  answers are not stored
- **Tests** — parts with instructions, reading passages and listening audio with a play limit
- **Two attempts per test** — time, draft answers and audio plays live on the server, so they
  survive a page reload or a change of device
- **Results** — score and history; correct answers open after all attempts are used
- **Profile** — avatar, personal data, password and email change

**For the admin**

- Dashboard, and results with search, sorting and pagination
- Creating, editing and deleting tests, including audio
- Approving or rejecting students, granting extra attempts, deleting accounts
  (results stay without a link to the person)
- Email notifications about new applications and decisions

**Site**

- Landing page, about page, contact form with spam protection
- Terms and privacy pages, recorded consent with a version
- SEO meta tags, sitemap and structured data

## 🛠 Technology stack

| Area       | Tools                                                           |
| ---------- | --------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, React Router v7, SCSS Modules       |
| Backend    | Supabase: PostgreSQL, Auth, Storage, RLS, Edge Functions (Deno) |
| Hosting    | Vercel, including Analytics and Speed Insights                  |
| Email      | Resend                                                          |
| Spam limit | Upstash Redis (contact form)                                    |
| Monitoring | Sentry                                                          |

There is no custom server. All sensitive logic runs in Postgres RPC functions or Edge Functions.

## 🏗 Architectural solutions

- **The server is the source of truth.** Scores, attempt limits, timers and audio plays are
  handled by RPC functions, so changing the client cannot change a result.
- **Answer keys stay hidden.** `answers.is_correct` is closed by column grants and never reaches
  the client with questions. Only `get_correct_answers` returns it, to an admin or to a student
  who has used all attempts.
- **Access is enforced in the database.** RLS policies and grants apply regardless of the UI.
  Test content is readable only by approved users.
- **Safe retries.** Repeating `submit_quiz_attempt` after a lost response returns the same result
  instead of creating a second one.
- **Editing does not rewrite history.** `save_test` updates a test in place and does not recalculate
  scores. Attempts made before a change are marked as outdated in the UI.
- **Open tabs survive a deploy.** A missing chunk triggers one automatic page reload.
- **Reports carry no personal data.** Sentry sends no user data, breadcrumbs or URL parameters.
- **Security headers.** CSP and other headers are set in `vercel.json`.

## 📁 Project structure

```text
src/
  modules/<feature>/   Pages and components; admin lives in modules/admin
  services/            All Supabase requests, one file per domain
  context/, hooks/     Auth state, quiz state, timers, data loading
  routes/              Protected, approved and admin route guards
  constants/, utils/   Routes, limits, formatting, validation
  data/                Static marketing and legal content
  lib/                 Supabase client and Sentry setup
  types/database.ts    Database row types
supabase/
  migrations/          Schema, RPC, RLS, grants, buckets (source of truth)
  functions/           send-contact-email, notify-profile-status, delete-student
vercel.json            SPA rewrite and security headers
```

## 🗄 Database Schema

**Content:** `levels` → `submodules` → `tests` (`placement_test` / `submodule_quiz` / `final_test`)
→ `test_parts` → `questions` → `answers`

**Users and results:**

- `profiles` — extends `auth.users`: role, approval status, name, email, avatar, consent, email confirmation
- `quiz_attempts` — active and finished attempts: deadlines, draft answers, audio plays
- `test_attempt_grants` — extra attempts given by the admin
- `results`, `result_answers` — finished attempts and their answers

**Site content:** `program`, `program_format`, `teachers`

**Storage:** `avatars` and `teachers` (public), `test-audio` (private, signed URLs)

**Not used by the client yet:** `submodules`, `theory_sections`, `writing_prompts`,
`writing_submissions`. The admin form creates only `final_test`; a placement test is added
directly in the database.

Table data is not stored in the repository: it is public, and a dump would contain answer keys.

## ⚙️ Running locally

```bash
git clone https://github.com/A1daros/Between-Testing_Platform.git
cd Between-Testing_Platform
npm install
npm run dev
```

Create `.env.local`; it is ignored by git:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# Optional: without it no error reports are sent
VITE_SENTRY_DSN=
```

| Command           | Purpose                               |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Dev server                            |
| `npm run build`   | Type check and production build       |
| `npm run lint`    | ESLint                                |
| `npm run preview` | Preview the production build locally  |
| `npm test`        | Client and edge function tests        |
| `npm run test:db` | Database tests (local stack only)     |

Database tests need Docker and a running local stack: `npx supabase start`, then `npx supabase db reset` to apply the migrations to a clean database. Nothing runs these checks automatically yet, so run `test`, `build` and `lint` before every merge, and `test:db` after any change to migrations, RPC functions or RLS.

The contact form and account deletion accept requests only from production and from
`localhost:5173` / `localhost:4173`. On a Vercel preview they fail with a CORS error.

## 🚢 Deploying changes

Vercel deploys `master` to production and creates a preview for every pull request.
`VITE_*` variables are built into the code, so changing one requires a redeploy.

**If a change touches several layers, deploy in this order:**

1. **Migration:** `npx supabase db push`
2. **Edge Function:** `npx supabase functions deploy <name>`
3. **Frontend:** merge the pull request

The frontend and functions may depend on new columns, so the database goes first.
Check the pull request description for exceptions before deploying.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase migration list
npx supabase secrets set NAME=value
```

**Migrations:** every schema change is a new file in `supabase/migrations`. Never edit an applied
migration. After a schema change, update `src/types/database.ts`.

## 🔑 Configuration outside the repository

**Vercel → Environment Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`

**Supabase → Edge Functions → Secrets:**

| Function                | Secrets                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `send-contact-email`    | `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CONTACT_TO_EMAIL` |
| `notify-profile-status` | `RESEND_API_KEY`, `WEBHOOK_SECRET`, `CONTACT_TO_EMAIL`, `SITE_URL`, optional `NOTIFY_FROM_EMAIL` |
| `delete-student`        | Provided by Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`                      |

**Supabase dashboard:**

- **Auth:** `Confirm email` on; Site URL and Redirect URLs; SMTP through Resend
- **Password settings:** minimum length `10`, matching `MIN_PASSWORD_LENGTH`. Keep
  `Secure password change` and `Require current password` off until the client supports them.
- **Database Webhook:** `public.profiles` (INSERT, UPDATE) → `notify-profile-status`, with the
  `x-webhook-secret` header

Never put a service-role key or other secrets in client code.

## 🧰 Common tasks

**Make a user an admin** (SQL Editor):

```sql
update public.profiles set role = 'admin', status = 'approved' where email = '…';
```

**Check that a migration reached the cloud:** `npx supabase migration list`

**Check Sentry:** run this in the browser console on production, then look in Issues:

```js
setTimeout(() => { throw new Error('Sentry test') })
```

**Other changes:**

| Task                     | Where                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| New public page          | `ROUTES`, `App.tsx`, `public/sitemap.xml` (updated by hand)                               |
| New external service     | `connect-src`, `img-src` or `media-src` of the CSP in `vercel.json`, plus the privacy policy |
| Legal text               | `src/data/legal.data.ts`; bump `LEGAL_VERSION` in `src/constants/legal.ts`                |
| Attempt limit            | `private.attempts_allowed` (new migration)                                                |
| Audio play limit         | `MAX_AUDIO_PLAYS` in `src/constants/quiz.ts` and the `register_audio_play` RPC            |
| School contacts          | `src/constants/school.ts`                                                                 |

**Move to a new Supabase project:** apply the migrations, add `levels` and landing data, then update
Vercel variables, the CSP domain in `vercel.json` and `preconnect` in `index.html`. Without the CSP
update, the browser blocks the database, login and audio, and the site stops working.

**Move to a custom domain:** see «Перехід на власний домен» in [CLAUDE.md](CLAUDE.md). The address is
also listed in the `allowedOrigins` of two Edge Functions; without updating them, the contact form
and account deletion stop working.

## 🩺 Troubleshooting

| Symptom                                       | Likely cause                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| The whole site fails after a long break       | Free-plan Supabase projects can be paused: restore the project in the dashboard                  |
| Registration email does not arrive            | While sending from `onboarding@resend.dev`, emails reach only the Resend account owner; verify a domain |
| Admin gets no email about a new application   | The applicant has not confirmed their email, or check the webhook and `notify-profile-status` logs |
| `Refused to…` in the browser console          | The CSP blocks a host: add it to `vercel.json`. On previews, `vercel.live` is expected           |
| CORS error in the contact form or deletion    | The current address is missing from `allowedOrigins`; expected on previews                       |
| No errors in Sentry                           | `VITE_SENTRY_DSN` is missing, or no redeploy after adding it                                     |
| New column errors, admin overview fails       | The frontend was deployed before its migration                                                   |

Client errors are in Sentry; Edge Function logs are in the Supabase dashboard.

## 📍 Before public launch

- [ ] Verify a domain in Resend and send from it
- [ ] Connect a custom domain and open indexing
- [ ] Move to paid Supabase and Vercel projects with a clean database
- [ ] Fill in the placeholders in `src/data/legal.data.ts` after review by a lawyer
- [ ] Require the current password when changing a password
- [ ] Make the result page independent of `location.state`

## 📄 License

All rights reserved. No license is granted to use, copy or distribute this code.
