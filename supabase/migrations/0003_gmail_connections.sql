-- Per-expert-profile Gmail connection for sending pitches from the
-- customer's own address instead of the shared pitch@quotarly.com. Kept as
-- its own table (not columns on expert_profiles) so reading the refresh
-- token always requires createAdminClient() -- same structural guard
-- already used for the admin-only `queries` table -- on top of the
-- app-level AES-256-GCM encryption applied before the value is stored.
create table public.gmail_connections (
  id uuid primary key default gen_random_uuid(),
  expert_profile_id uuid not null unique references public.expert_profiles(id) on delete cascade,
  gmail_email text not null,
  refresh_token_encrypted text not null,
  status text not null default 'active' check (status in ('active', 'revoked', 'error')),
  last_error text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gmail_connections enable row level security;
-- Deliberately no policy for authenticated/anon roles -- admin-only,
-- same pattern as `queries`.
