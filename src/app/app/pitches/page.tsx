import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";

export default async function SentPitchesPage() {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: pitches, error } = await supabase
    .from("pitches")
    .select("id, subject, body, sent_at, matches(queries(outlet_name, title))")
    .eq("status", "sent")
    .order("sent_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Pitches sent
      </h1>
      <p className="text-sm text-ink-soft">
        {pitches?.length ?? 0} pitches sent
      </p>

      {error ? (
        <p className="text-sm text-wire">
          Couldn&apos;t load your pitches — try refreshing.
        </p>
      ) : (
        !pitches?.length && (
          <p className="text-sm text-ink-soft">
            No pitches sent yet — they&apos;ll show up here as soon as one
            clears your bar.
          </p>
        )
      )}

      <ul className="space-y-3">
        {pitches?.map((p) => {
          const match = Array.isArray(p.matches) ? p.matches[0] : p.matches;
          const query = match?.queries
            ? Array.isArray(match.queries)
              ? match.queries[0]
              : match.queries
            : null;

          return (
            <li key={p.id}>
              <details className="group rounded-md border border-rule bg-surface open:pb-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {p.subject}
                    </p>
                    <p className="mt-0.5 font-dispatch text-xs text-ink-soft">
                      {query?.outlet_name ? `${query.outlet_name} · ` : ""}
                      Sent{" "}
                      {p.sent_at
                        ? new Date(p.sent_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink-soft transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>

                <div className="space-y-2 border-t border-rule px-4 pt-3 text-sm">
                  {query?.title && (
                    <p className="text-ink-soft">
                      In response to: {query.title}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-ink-soft">
                    {p.body}
                  </p>
                  {p.sent_at && (
                    <p className="font-dispatch text-xs text-ink-soft">
                      Sent {new Date(p.sent_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
