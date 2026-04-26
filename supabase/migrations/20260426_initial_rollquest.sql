-- RollQuest initial Supabase schema
-- Safe to run once on a new project.

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------
-- Core identities and memberships
-- -------------------------------------------------------------------
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Student',
  role text not null default 'student' check (role in ('student', 'coach', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gyms (
  id text primary key,
  name text not null,
  accent_color text not null default '#C8102E',
  logo_url text,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_gym_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gym_id text not null references public.gyms(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'coach', 'owner')),
  created_at timestamptz not null default now(),
  unique (user_id, gym_id)
);

-- -------------------------------------------------------------------
-- Sync/event layer + domain tables
-- -------------------------------------------------------------------
create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  gym_id text not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  event_ts timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_sync_events_gym_ts on public.sync_events (gym_id, event_ts desc);

create table if not exists public.technique_requests (
  id uuid primary key default gen_random_uuid(),
  gym_id text not null references public.gyms(id) on delete cascade,
  technique_id text not null,
  technique_name text not null,
  student_user_id uuid references auth.users(id) on delete set null,
  student_name text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'addressed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id text primary key,
  gym_id text not null references public.gyms(id) on delete cascade,
  title text not null,
  description text not null,
  due_date text,
  linked_technique_ids text[] not null default '{}',
  target_students text[] not null default '{}',
  completed_by text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rolling_logs (
  id uuid primary key default gen_random_uuid(),
  gym_id text references public.gyms(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  technique_id text not null,
  technique_name text not null,
  class_name text,
  notes text,
  logged_at timestamptz not null default now()
);

create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  gym_id text references public.gyms(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  date_key text not null,
  challenge_id text not null,
  technique_id text not null,
  technique_name text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, date_key, challenge_id)
);

-- -------------------------------------------------------------------
-- Trigger helpers
-- -------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_gyms_updated_at on public.gyms;
create trigger trg_gyms_updated_at
before update on public.gyms
for each row execute function public.set_updated_at();

drop trigger if exists trg_technique_requests_updated_at on public.technique_requests;
create trigger trg_technique_requests_updated_at
before update on public.technique_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_assignments_updated_at on public.assignments;
create trigger trg_assignments_updated_at
before update on public.assignments
for each row execute function public.set_updated_at();

-- Auto-create profile row for auth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, display_name, role)
  values (new.id, new.email, coalesce(split_part(new.email, '@', 1), 'Student'), 'student')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -------------------------------------------------------------------
-- RLS
-- -------------------------------------------------------------------
alter table public.user_profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.user_gym_memberships enable row level security;
alter table public.sync_events enable row level security;
alter table public.technique_requests enable row level security;
alter table public.assignments enable row level security;
alter table public.rolling_logs enable row level security;
alter table public.challenge_completions enable row level security;

-- Profiles: self access
drop policy if exists profiles_self_select on public.user_profiles;
create policy profiles_self_select on public.user_profiles
for select using (auth.uid() = user_id);

drop policy if exists profiles_self_update on public.user_profiles;
create policy profiles_self_update on public.user_profiles
for update using (auth.uid() = user_id);

-- Memberships: user can read own memberships
drop policy if exists memberships_self_select on public.user_gym_memberships;
create policy memberships_self_select on public.user_gym_memberships
for select using (auth.uid() = user_id);

-- Gyms: member can read
drop policy if exists gyms_member_select on public.gyms;
create policy gyms_member_select on public.gyms
for select using (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = gyms.id and m.user_id = auth.uid()
  )
);

-- Sync events: member can select/insert for own gyms
drop policy if exists sync_events_member_select on public.sync_events;
create policy sync_events_member_select on public.sync_events
for select using (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = sync_events.gym_id and m.user_id = auth.uid()
  )
);

drop policy if exists sync_events_member_insert on public.sync_events;
create policy sync_events_member_insert on public.sync_events
for insert with check (
  auth.uid() = user_id and
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = sync_events.gym_id and m.user_id = auth.uid()
  )
);

-- Technique requests, assignments, logs, challenge completions: gym member read/write
drop policy if exists tr_member_select on public.technique_requests;
create policy tr_member_select on public.technique_requests
for select using (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = technique_requests.gym_id and m.user_id = auth.uid()
  )
);

drop policy if exists tr_member_insert on public.technique_requests;
create policy tr_member_insert on public.technique_requests
for insert with check (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = technique_requests.gym_id and m.user_id = auth.uid()
  )
);

drop policy if exists asg_member_select on public.assignments;
create policy asg_member_select on public.assignments
for select using (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = assignments.gym_id and m.user_id = auth.uid()
  )
);

drop policy if exists asg_member_write on public.assignments;
create policy asg_member_write on public.assignments
for all using (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = assignments.gym_id and m.user_id = auth.uid()
      and m.role in ('coach', 'owner')
  )
) with check (
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = assignments.gym_id and m.user_id = auth.uid()
      and m.role in ('coach', 'owner')
  )
);

drop policy if exists rl_member_select on public.rolling_logs;
create policy rl_member_select on public.rolling_logs
for select using (
  gym_id is null or
  exists (
    select 1 from public.user_gym_memberships m
    where m.gym_id = rolling_logs.gym_id and m.user_id = auth.uid()
  )
);

drop policy if exists rl_self_insert on public.rolling_logs;
create policy rl_self_insert on public.rolling_logs
for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists cc_member_select on public.challenge_completions;
create policy cc_member_select on public.challenge_completions
for select using (auth.uid() = user_id);

drop policy if exists cc_self_insert on public.challenge_completions;
create policy cc_self_insert on public.challenge_completions
for insert with check (auth.uid() = user_id or user_id is null);
