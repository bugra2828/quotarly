import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";

export default async function BacklinksPage() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: backlinks, error } = await supabase
    .from("backlinks")
    .select("*, expert_profiles(owner_id)")
    .order("first_seen_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Your backlinks
      </h1>
      <p className="text-sm text-ink-soft">
        {backlinks?.length ?? 0} backlinks found
      </p>

      {error ? (
        <p className="text-sm text-wire">
          Couldn&apos;t load your backlinks — try refreshing.
        </p>
      ) : (
        !backlinks?.length && (
          <p className="text-sm text-ink-soft">
            No backlinks detected yet — checked daily once your pitches
            start getting picked up by journalists.
          </p>
        )
      )}

      <ul className="space-y-3">
        {backlinks?.map((b) => (
          <li key={b.id}>
            <details className="group rounded-md border border-rule bg-surface open:pb-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {b.outlet_domain}
                  </p>
                  <p className="mt-0.5 font-dispatch text-xs text-ink-soft">
                    {new Date(b.first_seen_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-dispatch text-xs ${
                      b.status === "live"
                        ? "bg-press/15 text-press"
                        : "bg-wire/15 text-wire"
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-ink-soft transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </div>
              </summary>

              <div className="space-y-1 border-t border-rule px-4 pt-3 text-sm text-ink-soft">
                <p>Authority score: {b.authority_score ?? "—"}</p>
                <p>{b.is_dofollow ? "Dofollow" : "Nofollow"} link</p>
                <p>
                  First seen:{" "}
                  {new Date(b.first_seen_at).toLocaleString()}
                </p>
                <a
                  href={b.article_url}
                  target="_blank"
                  className="inline-block text-ink underline"
                >
                  View article ↗
                </a>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
