-- Flip the default for expert_profiles.auto_approve: pitches that clear the
-- match bar now send automatically unless the client turns manual review on.
-- Existing profiles are backfilled to the new default too.

alter table public.expert_profiles
  alter column auto_approve set default true;

update public.expert_profiles
  set auto_approve = true
  where auto_approve = false;
