-- VELOIQ initial schema (Supabase / PostgreSQL)
create extension if not exists "pgcrypto";
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  weight_kg numeric(5,2),
  ftp_watts integer,
  max_hr integer,
  created_at timestamptz not null default now()
);
create table if not exists public.bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  discipline text not null check (discipline in ('road','mtb','gravel','other')),
  total_km numeric(10,1) not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes(id) on delete cascade,
  name text not null,
  km_since_service numeric(10,1) not null default 0,
  service_interval_km numeric(10,1),
  last_service_at date,
  notes text
);
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bike_id uuid references public.bikes(id) on delete set null,
  started_at timestamptz,
  distance_km numeric(8,2) not null,
  elevation_m integer not null default 0,
  duration_seconds integer,
  avg_power integer,
  avg_hr integer,
  source text default 'manual',
  created_at timestamptz not null default now()
);
create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_for date not null,
  title text not null,
  description text,
  target_zone text,
  completed boolean not null default false
);
alter table public.profiles enable row level security;
alter table public.bikes enable row level security;
alter table public.components enable row level security;
alter table public.rides enable row level security;
alter table public.training_sessions enable row level security;
create policy "profile owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "bike owner" on public.bikes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "component owner" on public.components for all using (exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = auth.uid())) with check (exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = auth.uid()));
create policy "ride owner" on public.rides for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "training owner" on public.training_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
