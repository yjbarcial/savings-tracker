-- Savings Tracker: initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push` if using the CLI).

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  bank text not null,
  start_month date not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists deposits (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade not null,
  amount numeric(12, 2) not null check (amount > 0),
  deposited_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists deposits_goal_id_idx on deposits(goal_id);
create index if not exists goals_user_id_idx on goals(user_id);

-- Row Level Security: every user can only ever see and touch their own data.
alter table goals enable row level security;
alter table deposits enable row level security;

create policy "Users can view their own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on goals for delete
  using (auth.uid() = user_id);

-- Deposits are scoped through their parent goal's ownership.
create policy "Users can view deposits on their own goals"
  on deposits for select
  using (exists (
    select 1 from goals where goals.id = deposits.goal_id and goals.user_id = auth.uid()
  ));

create policy "Users can insert deposits on their own goals"
  on deposits for insert
  with check (exists (
    select 1 from goals where goals.id = deposits.goal_id and goals.user_id = auth.uid()
  ));

create policy "Users can update deposits on their own goals"
  on deposits for update
  using (exists (
    select 1 from goals where goals.id = deposits.goal_id and goals.user_id = auth.uid()
  ));

create policy "Users can delete deposits on their own goals"
  on deposits for delete
  using (exists (
    select 1 from goals where goals.id = deposits.goal_id and goals.user_id = auth.uid()
  ));

-- Convenience view: each goal with its running total saved.
-- Querying this instead of joining manually in every page keeps the frontend simple.
create or replace view goal_status
  with (security_invoker = true) as
select
  g.id,
  g.user_id,
  g.name,
  g.target_amount,
  g.bank,
  g.start_month,
  g.status,
  g.created_at,
  coalesce(sum(d.amount), 0)::numeric(12, 2) as amount_saved,
  (g.target_amount - coalesce(sum(d.amount), 0))::numeric(12, 2) as remaining
from goals g
left join deposits d on d.goal_id = g.id
group by g.id;
