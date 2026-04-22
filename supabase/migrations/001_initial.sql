-- Singleton: always exactly one row (id = 1), the live site-wide config.
create table bulletin_config (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  schema_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

-- One row per bulletin, keyed by date.
create table bulletins (
  date date primary key,
  data jsonb not null,
  published_at timestamptz,
  schema_version smallint not null default 1,
  render_version smallint not null default 1,
  updated_at timestamptz not null default now()
);

create index bulletins_published_at_idx
  on bulletins(published_at)
  where published_at is not null;

-- Email-based admin allowlist; populated manually in Phase 2.
create table admin_allowlist (
  email text primary key
);

-- RLS: public reads; writes gated by allowlist (enforced in Phase 2).
alter table bulletin_config enable row level security;
alter table bulletins enable row level security;
alter table admin_allowlist enable row level security;

create policy "public can read config"
  on bulletin_config for select using (true);

create policy "public can read bulletins"
  on bulletins for select using (true);

-- Writes are blocked for anonymous users in Phase 1 (no write policies).
-- Phase 2 adds policies tied to admin_allowlist.
