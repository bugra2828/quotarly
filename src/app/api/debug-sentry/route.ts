import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const dsnSet = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  const dsnPrefix = (process.env.NEXT_PUBLIC_SENTRY_DSN ?? "").slice(0, 20);
  const client = Sentry.getClient();
  const clientDsn = client?.getDsn()?.host ?? "no-client";

  Sentry.captureException(new Error("Quotarly Sentry verification test error"));
  const flushed = await Sentry.flush(3000);

  return new Response(
    JSON.stringify({ dsnSet, dsnPrefix, clientDsn, flushed }),
    { headers: { "Content-Type": "application/json" } }
  );
}
