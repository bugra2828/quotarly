-- Resend retries a webhook it considers undelivered, so the same email could be
-- parsed and drafted several times. The provider's message id makes a redelivery
-- detectable. Nullable because Postmark rows and older rows do not have one.
alter table public.inbound_emails
  add column provider_message_id text unique;
