import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function BacklinksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: backlinks } = await supabase
    .from("backlinks")
    .select("*, expert_profiles(owner_id)")
    .order("first_seen_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Your backlinks</h1>
      <p className="text-sm text-muted-foreground">
        {backlinks?.length ?? 0} backlinks found
      </p>

      {!backlinks?.length && (
        <p className="text-sm text-muted-foreground">
          No backlinks detected yet — checked daily once your pitches start
          getting picked up by journalists.
        </p>
      )}

      <ul className="space-y-2">
        {backlinks?.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-lg border p-4 text-sm"
          >
            <div>
              <a
                href={b.article_url}
                target="_blank"
                className="font-medium underline"
              >
                {b.outlet_domain}
              </a>
              <p className="text-muted-foreground">
                Authority: {b.authority_score ?? "—"} ·{" "}
                {b.is_dofollow ? "dofollow" : "nofollow"} ·{" "}
                {new Date(b.first_seen_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs uppercase ${
                b.status === "live"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {b.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
