-- Qwoted was added as a recognized inbound source in the app code but the
-- check constraint here was never updated, so every Qwoted email failed to
-- insert with a constraint violation (surfaced to Postmark as a 500).
alter table public.inbound_emails drop constraint inbound_emails_source_check;
alter table public.inbound_emails add constraint inbound_emails_source_check
  check (source in ('haro', 'sos', 'hab2bw', 'qwoted', 'other'));
