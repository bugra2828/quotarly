import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  sent: "bg-press/15 text-press",
  approved: "bg-press/15 text-press",
  pending_approval: "bg-wire/15 text-wire",
  failed: "bg-wire/15 text-wire",
  rejected: "bg-ink-soft/15 text-ink-soft",
  expired: "bg-ink-soft/15 text-ink-soft",
  draft: "bg-ink-soft/15 text-ink-soft",
};

export default async function AdminPitchesPage() {
  const supabase = await createClient();

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*, matches(score, reasoning, queries(title, outlet_name)), expert_profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Generated pitches
      </h1>
      <p className="text-sm text-ink-soft">{pitches?.length ?? 0} pitches</p>

      <ul className="space-y-4">
        {pitches?.map((p) => {
          const match = Array.isArray(p.matches) ? p.matches[0] : p.matches;
          const query = match?.queries
            ? Array.isArray(match.queries)
              ? match.queries[0]
              : match.queries
            : null;
          const expert = Array.isArray(p.expert_profiles)
            ? p.expert_profiles[0]
            : p.expert_profiles;

          return (
            <li key={p.id} className="rounded-md border border-rule bg-surface p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">
                  {expert?.display_name} → {query?.title ?? "(query)"}
                </span>
                <span
                  className={`font-dispatch rounded-full px-2.5 py-0.5 text-xs ${
                    statusColor[p.status] ?? "bg-ink-soft/15 text-ink-soft"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              {match && (
                <p className="text-xs text-ink-soft">
                  Match score: {match.score} — {match.reasoning}
                </p>
              )}
              <p className="mt-2 font-medium text-ink">Subject: {p.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-ink-soft">{p.body}</p>
            </li>
          );
        })}
      </ul>

      {!pitches?.length && (
        <p className="text-sm text-ink-soft">
          No pitches yet — waiting for a matching query.
        </p>
      )}
    </div>
  );
}
