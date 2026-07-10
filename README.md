# Savings Tracker

A simple system for setting savings goals and tracking deposits toward them —
built as a lighter replacement for doing this in Excel.

**Stack:** Nuxt 3 (frontend) + Supabase (Postgres database, auth, API) + Vercel (hosting).
No separate backend server — Supabase's client library talks straight to Postgres,
protected by Row Level Security.

## Features

- Set a goal: name, target amount, bank, starting month
- Per-goal status: target, amount saved, remaining balance, bank, progress bar
- Add deposits against a goal, with date and optional note
- Deposit history per goal, with the ability to remove entries
- Mark goals as completed
- Dashboard total across all goals
- Email magic-link sign-in (no passwords) — safe to deploy publicly since every
  row is scoped to its owner via Row Level Security

## Project structure

```
app/
  assets/css/main.css      -- design tokens + shared styles
  components/
    GoalForm.vue            -- "set a goal" form
    GoalCard.vue             -- summary card on the dashboard
    DepositForm.vue          -- "add a deposit" form
    ProgressBar.vue          -- reusable progress bar
  composables/
    useGoals.ts              -- all goal-related Supabase queries
    useDeposits.ts           -- all deposit-related Supabase queries
  layouts/default.vue        -- header + logout
  pages/
    login.vue                -- magic link sign-in
    confirm.vue               -- redirect target after clicking the email link
    index.vue                 -- dashboard: goal form + goal list
    goals/[id].vue            -- goal detail: full status + deposits
supabase/migrations/0001_init.sql  -- database schema, RLS policies, and a
                                       goal_status view that computes saved /
                                       remaining totals for you
```

Composables are the only place that talk to Supabase. If you change the schema
later, you should only need to touch `useGoals.ts` / `useDeposits.ts` — pages
and components stay the same.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** and run the contents of `supabase/migrations/0001_init.sql`.
   This creates the `goals` and `deposits` tables, enables Row Level Security,
   and adds a `goal_status` view used by the dashboard.
3. In **Authentication -> Providers**, confirm Email is enabled. In
   **Authentication -> URL Configuration**, add `http://localhost:3000/confirm`
   as a redirect URL for local development (add your deployed URL later too).
4. Copy your **Project URL** and **anon public key** from Settings -> API.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `SUPABASE_URL` and `SUPABASE_KEY` with the values from step 1.

### 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login` — enter your
email and open the magic link to sign in.

## Deploying to Vercel

This deploys the same way as any Nuxt 3 project:

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" -> import the repo (framework preset: Nuxt.js
   is auto-detected).
3. Add the same two environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) in
   Vercel's Project Settings -> Environment Variables.
4. In Supabase, add your Vercel URL's `/confirm` path (e.g.
   `https://your-app.vercel.app/confirm`) to Authentication -> URL Configuration
   as an allowed redirect URL, or magic links won't be able to log you back in
   after deploying.
5. Deploy.

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

## Notes on the schema

- `goal_status` is a Postgres **view**, not a table — it just joins `goals`
  with a `sum()` of `deposits` so the dashboard doesn't need to compute totals
  in JavaScript. It's created `with (security_invoker = true)` so it still
  respects each user's Row Level Security policies.
- All deletes cascade: deleting a goal removes its deposits automatically.
