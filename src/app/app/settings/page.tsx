import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { disconnectGmail } from "@/app/actions/gmail";
import { cancelSubscription } from "@/app/actions/billing";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { redirect } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Connection cancelled — nothing changed.",
  missing_profile: "No profile was specified.",
  not_found: "Couldn't find that profile.",
  invalid_request: "Something went wrong starting the connection. Try again.",
  invalid_state: "This connection link expired. Try again.",
  not_signed_in: "You were signed out mid-connection. Sign in and try again.",
  no_refresh_token:
    "Google didn't return the access we need — try disconnecting any prior access at myaccount.google.com/permissions and reconnecting.",
  no_email: "Couldn't read the connected account's email address.",
  save_failed: "Couldn't save the connection. Try again.",
  exchange_failed: "Couldn't complete the connection with Google. Try again.",
};

const BILLING_ERROR_MESSAGES: Record<string, string> = {
  no_active_subscription: "There's no active subscription to cancel.",
  unsupported_provider: "This subscription can't be canceled from here — contact support.",
  cancel_failed: "Couldn't cancel the subscription. Try again or contact support.",
};

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    connected?: string;
    gmail_error?: string;
    billing_canceled?: string;
    billing_error?: string;
  }>;
}) {
  const { connected, gmail_error, billing_canceled, billing_error } = await searchParams;

  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: expertProfiles } = await supabase
    .from("expert_profiles")
    .select("id, display_name")
    .eq("owner_id", user.id);

  const profileIds = (expertProfiles ?? []).map((ep) => ep.id);

  const admin = createAdminClient();
  const [{ data: connections }, { data: subscription }] = await Promise.all([
    profileIds.length > 0
      ? admin
          .from("gmail_connections")
          .select("expert_profile_id, gmail_email, connected_at")
          .in("expert_profile_id", profileIds)
      : Promise.resolve({ data: [] }),
    admin
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const connectionByProfileId = new Map(
    (connections ?? []).map((c) => [c.expert_profile_id, c])
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Settings
      </h1>

      {connected && (
        <p className="rounded-md border border-press/40 bg-press/10 p-3 text-sm text-press">
          Gmail connected.
        </p>
      )}
      {gmail_error && (
        <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
          {ERROR_MESSAGES[gmail_error] ?? "Something went wrong."}
        </p>
      )}
      {billing_canceled && (
        <p className="rounded-md border border-press/40 bg-press/10 p-3 text-sm text-press">
          Subscription canceled.
        </p>
      )}
      {billing_error && (
        <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
          {BILLING_ERROR_MESSAGES[billing_error] ?? "Something went wrong."}
        </p>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Billing
        </h2>

        {subscription ? (
          <div className="card-elevated-brand mt-4 rounded-md border border-rule bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-ink">
                  {PLAN_LABELS[subscription.plan ?? ""] ?? subscription.plan ?? "Unknown plan"}
                  {" · "}
                  <span className="capitalize text-ink-soft">{subscription.status}</span>
                </p>
                {subscription.status === "past_due" && (
                  <p className="mt-1 text-sm text-wire">
                    Your last payment failed. Update your card or contact
                    support before access is paused.
                  </p>
                )}
                {subscription.current_period_end &&
                  subscription.status !== "canceled" && (
                    <p className="mt-1 text-sm text-ink-soft">
                      Next payment{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString("en-GB")}
                    </p>
                  )}
              </div>

              {subscription.status !== "canceled" && (
                <form action={cancelSubscription}>
                  <button className="btn-raised-wire rounded-full bg-wire/90 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-wire">
                    Cancel subscription
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            No active subscription. <a href="/pricing" className="underline">See pricing</a>.
          </p>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Sending
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Connect Gmail to send pitches from your own address instead of
          quotarly.com.
        </p>

        <ul className="mt-4 space-y-3">
          {(expertProfiles ?? []).map((ep) => {
            const connection = connectionByProfileId.get(ep.id);
            return (
              <li
                key={ep.id}
                className="card-elevated-brand rounded-md border border-rule bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{ep.display_name}</p>
                    {connection ? (
                      <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                        <span className="h-2 w-2 rounded-full bg-press" />
                        Connected as {connection.gmail_email} · since{" "}
                        {new Date(connection.connected_at).toLocaleDateString("en-GB")}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-ink-soft">
                        Not connected — pitches send from quotarly.com.
                      </p>
                    )}
                  </div>

                  {connection ? (
                    <form action={disconnectGmail}>
                      <input
                        type="hidden"
                        name="expert_profile_id"
                        value={ep.id}
                      />
                      <button className="btn-raised-wire rounded-full bg-wire/90 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-wire">
                        Disconnect
                      </button>
                    </form>
                  ) : (
                    <a
                      href={`/auth/gmail/connect?expert_profile_id=${ep.id}`}
                      className="btn-raised-brand rounded-full bg-brand-solid px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
                    >
                      Connect Gmail
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <DeleteAccountSection />
    </div>
  );
}
