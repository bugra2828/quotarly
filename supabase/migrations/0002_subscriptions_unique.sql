alter table public.subscriptions
  add constraint subscriptions_provider_subscription_id_key
  unique (provider_subscription_id);
