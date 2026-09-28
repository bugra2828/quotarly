import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  defaultIntegrations: false,
  integrations: [
    Sentry.eventFiltersIntegration(),
    Sentry.functionToStringIntegration(),
    Sentry.breadcrumbsIntegration(),
    Sentry.globalHandlersIntegration(),
    Sentry.linkedErrorsIntegration(),
    Sentry.dedupeIntegration(),
  ],
});
