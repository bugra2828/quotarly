import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { disconnectGmail } from "@/app/actions/gmail";
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

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; gmail_error?: string }>;
}) {
  const { connected, gmail_error } = await searchParams;

  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: expertProfiles } = await supabase
    .from("expert_profiles")
    .select("id, display_name")
    .eq("owner_id", user.id);

  const profileIds = (expertProfiles ?? []).map((ep) => ep.id);

  const admin = createAdminClient();
  const { data: connections } =
    profileIds.length > 0
      ? await admin
          .from("gmail_connections")
          .select("expert_profile_id, gmail_email, connected_at")
          .in("expert_profile_id", profileIds)
      : { data: [] };

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
                        {new Date(connection.connected_at).toLocaleDateString()}
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
    </div>
  );
}
