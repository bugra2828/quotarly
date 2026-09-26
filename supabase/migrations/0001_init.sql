-- Quotarly initial schema
-- Run this once in Supabase Studio -> SQL Editor (or via `supabase db push`).

-- ============================================================
-- profiles (1-1 with auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'client' check (role in ('client', 'admin')),
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- expert_profiles (the customer's represented expert identity)
-- ============================================================
create table public.expert_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  job_title text,
  company text,
  website_url text,
  target_url text,
  bio text,
  expertise_topics text[] not null default '{}',
  excluded_topics text[] not null default '{}',
  tone text,
  sample_quotes text[] not null default '{}',
  headshot_url text,
  linkedin_url text,
  auto_approve boolean not null default false,
  min_match_score int not null default 70,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- inbound_emails (raw newsletter emails, admin/service only)
-- ============================================================
create table public.inbound_emails (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('haro', 'sos', 'hab2bw', 'other')),
  subject text,
  from_email text,
  raw_text text,
  raw_html text,
  received_at timestamptz not null default now(),
  parsed boolean not null default false
);

-- ============================================================
-- queries (individual journalist questions, admin/service only)
-- ============================================================
create table public.queries (
  id uuid primary key default gen_random_uuid(),
  inbound_email_id uuid references public.inbound_emails(id) on delete set null,
  source text not null,
  title text,
  body text,
  category text,
  outlet_name text,
  outlet_domain text,
  outlet_authority int,
  journalist_name text,
  reply_email text,
  requirements text,
  deadline timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- matches (query x expert_profile scoring)
-- ============================================================
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.queries(id) on delete cascade,
  expert_profile_id uuid not null references public.expert_profiles(id) on delete cascade,
  score int not null,
  reasoning text,
  created_at timestamptz not null default now(),
  unique (query_id, expert_profile_id)
);

-- ============================================================
-- pitches
-- ============================================================
create table public.pitches (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  expert_profile_id uuid not null references public.expert_profiles(id) on delete cascade,
  subject text,
  body text,
  edited_body text,
  status text not null default 'draft' check (status in
    ('draft', 'pending_approval', 'approved', 'rejected', 'sent', 'failed', 'expired')),
  approved_at timestamptz,
  sent_at timestamptz,
  resend_message_id text,
  error text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- backlinks
-- ============================================================
create table public.backlinks (
  id uuid primary key default gen_random_uuid(),
  expert_profile_id uuid not null references public.expert_profiles(id) on delete cascade,
  pitch_id uuid references public.pitches(id) on delete set null,
  article_url text not null,
  outlet_domain text,
  target_url text,
  anchor_text text,
  is_dofollow boolean,
  authority_score int,
  first_seen_at timestamptz not null default now(),
  verified_at timestamptz,
  status text not null default 'live' check (status in ('live', 'lost'))
);

-- ============================================================
-- subscriptions
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- monthly_reports
-- ============================================================
create table public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  expert_profile_id uuid not null references public.expert_profiles(id) on delete cascade,
  month date not null,
  pitches_sent int not null default 0,
  backlinks_won int not null default 0,
  avg_authority numeric,
  pdf_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.expert_profiles enable row level security;
alter table public.inbound_emails enable row level security;
alter table public.queries enable row level security;
alter table public.matches enable row level security;
alter table public.pitches enable row level security;
alter table public.backlinks enable row level security;
alter table public.subscriptions enable row level security;
alter table public.monthly_reports enable row level security;

-- helper: is the current user an admin?
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: a user sees/edits only their own row; admins see all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- expert_profiles: owner or admin
create policy "expert_profiles_all_own_or_admin" on public.expert_profiles
  for all using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- inbound_emails / queries: admin (and service role) only
create policy "inbound_emails_admin_only" on public.inbound_emails
  for all using (public.is_admin()) with check (public.is_admin());
create policy "queries_admin_only" on public.queries
  for all using (public.is_admin()) with check (public.is_admin());

-- matches: visible to the owning client (via expert_profile) or admin
create policy "matches_select_own_or_admin" on public.matches
  for select using (
    public.is_admin() or exists (
      select 1 from public.expert_profiles ep
      where ep.id = matches.expert_profile_id and ep.owner_id = auth.uid()
    )
  );
create policy "matches_admin_write" on public.matches
  for insert with check (public.is_admin());
create policy "matches_admin_update" on public.matches
  for update using (public.is_admin());

-- pitches: owner can select/update (approve/reject/edit), admin full access
create policy "pitches_select_own_or_admin" on public.pitches
  for select using (
    public.is_admin() or exists (
      select 1 from public.expert_profiles ep
      where ep.id = pitches.expert_profile_id and ep.owner_id = auth.uid()
    )
  );
create policy "pitches_update_own_or_admin" on public.pitches
  for update using (
    public.is_admin() or exists (
      select 1 from public.expert_profiles ep
      where ep.id = pitches.expert_profile_id and ep.owner_id = auth.uid()
    )
  );
create policy "pitches_admin_insert" on public.pitches
  for insert with check (public.is_admin());

-- backlinks: owner can read, admin full access
create policy "backlinks_select_own_or_admin" on public.backlinks
  for select using (
    public.is_admin() or exists (
      select 1 from public.expert_profiles ep
      where ep.id = backlinks.expert_profile_id and ep.owner_id = auth.uid()
    )
  );
create policy "backlinks_admin_write" on public.backlinks
  for all using (public.is_admin()) with check (public.is_admin());

-- subscriptions: owner can read, admin full access
create policy "subscriptions_select_own_or_admin" on public.subscriptions
  for select using (owner_id = auth.uid() or public.is_admin());
create policy "subscriptions_admin_write" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- monthly_reports: owner can read, admin full access
create policy "monthly_reports_select_own_or_admin" on public.monthly_reports
  for select using (
    public.is_admin() or exists (
      select 1 from public.expert_profiles ep
      where ep.id = monthly_reports.expert_profile_id and ep.owner_id = auth.uid()
    )
  );
create policy "monthly_reports_admin_write" on public.monthly_reports
  for all using (public.is_admin()) with check (public.is_admin());
