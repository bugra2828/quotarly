-- Auto-send was removed from the app: every pitch now waits for the expert to
-- review and send it, because journalist request services ban unreviewed AI
-- pitches. The column stays for history, but nothing reads it, and it should
-- never be true again.
alter table public.expert_profiles
  alter column auto_approve set default false;

update public.expert_profiles
  set auto_approve = false
  where auto_approve = true;
