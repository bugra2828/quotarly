-- Backlink attribution: only links that come from an outlet we pitched count
-- as Quotarly links (dashboard, reports, and the money-back guarantee).
--
-- origin:
--   quotarly    - found on an outlet we sent a pitch to, after the pitch went out
--   preexisting - already pointed at the customer's site when we first scanned it
--   other       - legacy rows recorded before attribution existed
alter table public.backlinks
  add column origin text not null default 'quotarly'
    check (origin in ('quotarly', 'preexisting', 'other')),
  add column last_checked_at timestamptz,
  -- Consecutive daily checks that fetched the article but didn't find the
  -- link. A link is only marked lost after several, since some pages render
  -- links with JavaScript or briefly change.
  add column missing_checks int not null default 0;

-- Rows recorded so far came from the old "every backlink to the domain" scan,
-- so none of them can be attributed to a pitch.
update public.backlinks set origin = 'other' where pitch_id is null;

-- One row per article per expert, so repeated scans stay idempotent.
create unique index backlinks_expert_article_key
  on public.backlinks (expert_profile_id, article_url);

-- When we recorded the customer's existing backlinks as the baseline.
alter table public.expert_profiles
  add column backlinks_baselined_at timestamptz;
