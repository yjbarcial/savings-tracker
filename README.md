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
