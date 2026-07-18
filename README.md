# Savings Tracker

A simple system for setting savings goals and tracking deposits toward them —
built as a lighter replacement for doing this in Excel.

**Stack:** Nuxt 3 (frontend) + Supabase (Postgres database, auth, API) + Vercel (hosting).
No separate backend server — Supabase's client library talks straight to Postgres,
protected by Row Level Security.

## Features

- Set a goal: name, target amount, bank, starting month
- Edit a goal's details, or delete it entirely (with confirmation)
- Per-goal status: target, amount saved, remaining balance, bank, progress bar
- Add deposits against a goal, with date and optional note
- Edit or remove individual deposits (with confirmation)
- Mark goals as completed, or archive them to hide without deleting
- Dashboard grouped into active / completed / archived sections, with
  completed and archived collapsed by default
- Dashboard total across active + completed goals
- Email magic-link sign-in (no passwords) — safe to deploy publicly since every
  row is scoped to its owner via Row Level Security
- Custom SMTP support (e.g. Resend) so login emails aren't limited by
  Supabase's low-volume built-in test sender

## Project structure

\`\`\`
app/
assets/css/main.css -- design tokens + shared styles
components/
GoalForm.vue -- "set a goal" form; also handles editing
an existing goal (pass an `edit-goal` prop)
GoalCard.vue -- summary card on the dashboard
DepositForm.vue -- "add a deposit" form
DepositRow.vue -- one deposit in the history list; toggles
into an inline edit form
ProgressBar.vue -- reusable progress bar
ConfirmDialog.vue -- reusable confirmation modal (replaces
browser confirm() popups)
composables/
useGoals.ts -- all goal-related Supabase queries
useDeposits.ts -- all deposit-related Supabase queries
layouts/default.vue -- header, logged-in email, logout
pages/
login.vue -- magic link sign-in
confirm.vue -- redirect target after clicking the email link
index.vue -- dashboard: goal form + grouped goal list
goals/[id].vue -- goal detail: full status, edit, archive,
deposits
supabase/migrations/0001_init.sql -- database schema, RLS policies, and a
goal_status view that computes saved /
remaining totals for you
\`\`\`

Composables are the only place that talk to Supabase. If you change the schema
later, you should only need to touch `useGoals.ts` / `useDeposits.ts` — pages
and components stay the same.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** and run the contents of `supabase/migrations/0001_init.sql`.
   This creates the `goals` and `deposits` tables, enables Row Level Security,
   sets `user_id` to default to `auth.uid()` (so it's always filled in
   automatically and correctly), and adds a `goal_status` view used by the
   dashboard.
3. In **Authentication -> Providers**, confirm Email is enabled.
4. In **Authentication -> URL Configuration**:
   - Set **Site URL** to your deployed URL once you have one (e.g.
     `https://your-app.vercel.app`).
   - Add both `http://localhost:3000/confirm` and
     `https://your-app.vercel.app/confirm` under **Redirect URLs**. Both need
     to be listed explicitly, or Supabase falls back to the bare Site URL and
     magic links won't land where the app expects.
5. Copy your **Project URL** and **anon public key** from Settings -> API.

### 2. (Recommended) Set up custom SMTP

Supabase's built-in email sender is capped at a handful of emails per hour —
fine for a quick test, too restrictive for real use. To lift that:

1. Sign up for a free email provider like [Resend](https://resend.com).
2. In Supabase: **Project Settings -> Authentication -> SMTP Settings** ->
   enable custom SMTP -> paste in your provider's host/port/username/password.
3. Note: sending from a provider's sandbox address (no verified domain)
   usually only delivers to your own account's email. Sending to arbitrary
   people requires verifying a real domain with your provider — or you can
   skip custom SMTP entirely and just use Supabase's built-in sender, which
   works for any recipient, just at a lower volume.

### 3. Configure environment variables

\`\`\`bash
cp .env.example .env
\`\`\`

Fill in `SUPABASE_URL` and `SUPABASE_KEY` with the values from step 1.
`SUPABASE_URL` should be the bare project URL only — no trailing path like
`/rest/v1`.

### 4. Install and run

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000`. You'll be redirected to `/login` — enter your
email and open the magic link to sign in. The link only works on the same
device and browser session where you requested it while running locally,
since it points at `localhost`.

## Deploying to Vercel

This deploys the same way as any Nuxt 3 project:

1. Push this repo to GitHub — using `git push` from the command line or
   GitHub Desktop, **not** the GitHub website's drag-and-drop uploader. The
   uploader ignores `.gitignore` and will commit `node_modules`, `.nuxt`, and
   `.env` if they're sitting in your project folder, which breaks the Vercel
   build and leaks your Supabase key publicly.
2. In Vercel, "Add New Project" -> import the repo (framework preset: Nuxt.js
   is auto-detected).
3. Add the same two environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) in
   Vercel's Project Settings -> Environment Variables.
4. Make sure Supabase's **Redirect URLs** (Authentication -> URL
   Configuration) include your Vercel URL's `/confirm` path, as noted in step
   1.4 above — otherwise magic links won't be able to log you back in after
   deploying.
5. Deploy.

## Troubleshooting

- **`npm error code 126` on `nuxt prepare` during a Vercel build** — almost
  always means `node_modules`, `.nuxt`, or `.output` got committed to the
  repo. Check the repo's file list on GitHub; if any of those folders are
  there, remove them with `git rm -r --cached <folder>`, commit, push, then
  redeploy on Vercel with the build cache cleared.
- **Magic link lands on `/?code=...` instead of `/confirm?code=...`** — the
  exact redirect URL isn't in Supabase's allow-list. See step 1.4 above.
- **"This site can't be reached" after clicking the email link** — the link
  points at `localhost`, which only resolves on the device and active dev
  session that requested it. Request the link from your live Vercel URL
  instead if you're checking email on a different device.
- **"Email rate limit exceeded"** — you're using Supabase's built-in test
  email sender. See "Set up custom SMTP" above, or just wait — the limit
  resets after about an hour.
- **A different email always 500s, but your own works** — your SMTP
  provider's sandbox mode only sends to the account's own address. Verify a
  real domain with your provider, or fall back to Supabase's built-in sender
  (works for any recipient, lower volume).
- **`new row violates row-level security policy`** — usually means
  `user_id` wasn't included in an insert. The migration in this repo already
  sets `user_id` to default to `auth.uid()` so this shouldn't come up, but if
  you're working from an older version of the schema, run:
  `alter table goals alter column user_id set default auth.uid();`

## Extending this later

Some natural next steps, none of which require touching the existing schema
much:

- **Target date per goal** — add a `target_date` column, then show "on track /
  behind pace" instead of just percent saved.
- **Recurring deposits** — a small cron-triggered Supabase Edge Function that
  inserts a deposit on a schedule.
- **Shared goals** — add a `goal_members` join table if you and your partner
  want to track a goal together.
- **Charts** — a monthly savings trend chart using the existing `deposits`
  table, no schema change needed.
- **CSV export** — since this replaces an Excel workflow, exporting goals and
  deposits back out is a natural fit and needs no schema change.

## Generating real types (optional, removes the `any` typing)

Right now `useGoals.ts` / `useDeposits.ts` type the Supabase client as `any`
because there's no generated type file yet. Without it, TypeScript defaults
to `Database = unknown` and every table looks like `never`, which throws
errors like `Object literal may only specify known properties`.

To fix this properly, generate real types from your schema:

\`\`\`bash
npx supabase login
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > app/types/database.types.ts
\`\`\`

(Your project ref is the subdomain in your Supabase URL, e.g. `abcdefghijk`.)

Then in both composables, change `useSupabaseClient<any>()` back to
`useSupabaseClient()` — the module will automatically pick up the generated
file and give you full autocomplete and type safety on every query.

## Notes on the schema

- `goal_status` is a Postgres **view**, not a table — it just joins `goals`
  with a `sum()` of `deposits` so the dashboard doesn't need to compute totals
  in JavaScript. It's created `with (security_invoker = true)` so it still
  respects each user's Row Level Security policies.
- `goals.user_id` defaults to `auth.uid()`, so the frontend never needs to
  pass it explicitly on insert — one less place for bugs to creep in.
- All deletes cascade: deleting a goal removes its deposits automatically.
- Goal `status` is one of `active`, `completed`, or `archived`. Archiving is
  meant as a soft-hide (keeps history, removes it from the main dashboard
  view) as an alternative to deleting outright.
