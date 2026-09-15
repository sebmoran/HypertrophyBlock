-- Lower Body Program Tracker — Supabase schema
-- Run this once in your new Supabase project's SQL Editor.

create table lift_entries (
  id bigint generated always as identity primary key,
  entry_date date not null,
  day_type text not null check (day_type in ('Sunday','Tuesday','Thursday')),
  exercise text not null,
  set_number int not null,
  load_kg numeric,
  reps int,
  rir numeric,
  velocity_ms numeric,
  is_test_set boolean not null default false,
  is_velocity_check boolean not null default false,
  created_at timestamptz not null default now()
);

create table cmj_entries (
  id bigint generated always as identity primary key,
  entry_date date not null,
  jump_height_cm numeric,
  impulse_ns numeric,
  mrsi numeric,
  concentric_mean_power_w numeric,
  peak_force_n numeric,
  bodyweight_kg numeric,
  braking_duration_ms numeric,
  cm_depth_cm numeric,
  created_at timestamptz not null default now()
);

create table body_entries (
  id bigint generated always as identity primary key,
  entry_date date not null,
  weight_kg numeric,
  waist_cm numeric,
  thigh_cm numeric,
  created_at timestamptz not null default now()
);

create table session_ratings (
  id bigint generated always as identity primary key,
  entry_date date not null,
  day_type text not null check (day_type in ('Sunday','Tuesday','Thursday')),
  soreness numeric check (soreness between 0 and 10),
  difficulty numeric check (difficulty between 0 and 10),
  created_at timestamptz not null default now()
);

create table technical_ratings (
  id bigint generated always as identity primary key,
  entry_date date not null,
  lift text not null check (lift in ('Snatch','Clean & Jerk')),
  score numeric check (score between 1 and 5),
  created_at timestamptz not null default now()
);

-- Row Level Security: open policies for personal single-user use.
-- The anon key is safe to expose client-side (that's how Supabase's public
-- client works) but these policies allow anyone with the URL/key to read
-- and write. Fine for a personal tracker; tighten with Supabase Auth if
-- you ever want this properly locked down.
alter table lift_entries enable row level security;
alter table cmj_entries enable row level security;
alter table body_entries enable row level security;
alter table session_ratings enable row level security;
alter table technical_ratings enable row level security;

create policy "public access" on lift_entries for all using (true) with check (true);
create policy "public access" on cmj_entries for all using (true) with check (true);
create policy "public access" on body_entries for all using (true) with check (true);
create policy "public access" on session_ratings for all using (true) with check (true);
create policy "public access" on technical_ratings for all using (true) with check (true);
