import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPitchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/app");

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*, matches(score, reasoning, queries(title, outlet_name)), expert_profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Generated pitches</h1>
      <p className="text-sm text-muted-foreground">
        {pitches?.length ?? 0} pitches
      </p>

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
            <li key={p.id} className="rounded-lg border p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {expert?.display_name} → {query?.title ?? "(query)"}
                </span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                  {p.status}
                </span>
              </div>
              {match && (
                <p className="text-xs text-muted-foreground">
                  Match score: {match.score} — {match.reasoning}
                </p>
              )}
              <p className="mt-2 font-medium">Subject: {p.subject}</p>
              <p className="mt-1 whitespace-pre-wrap">{p.body}</p>
            </li>
          );
        })}
      </ul>

      {!pitches?.length && (
        <p className="text-sm text-muted-foreground">
          No pitches yet — waiting for a matching query.
        </p>
      )}
    </div>
  );
}
