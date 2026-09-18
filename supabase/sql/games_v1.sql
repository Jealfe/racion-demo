create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('words','drawing')),
  status text not null default 'active' check (status in ('active','finished')),
  starter_author text not null,
  partner_author text not null,
  current_author text,
  current_step integer not null default 0 check (current_step >= 0),
  total_steps integer not null check (total_steps in (4,6)),
  scenario_key text check (scenario_key is null or scenario_key in ('classic','absurd','dialogue','bad_plan','weird_day','date','superpower','trip')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create unique index if not exists game_sessions_one_active_idx
  on public.game_sessions ((status))
  where status = 'active';

create index if not exists game_sessions_finished_idx
  on public.game_sessions (finished_at desc)
  where status = 'finished';

create table if not exists public.game_turns (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.game_sessions(id) on delete cascade,
  step integer not null check (step >= 0),
  author_name text not null,
  text text,
  image_path text,
  preview_data text,
  created_at timestamptz not null default now(),
  unique (game_id, step)
);

create index if not exists game_turns_game_step_idx
  on public.game_turns (game_id, step);

alter table public.game_sessions enable row level security;
alter table public.game_turns enable row level security;

revoke all on table public.game_sessions from anon, authenticated;
revoke all on table public.game_turns from anon, authenticated;
