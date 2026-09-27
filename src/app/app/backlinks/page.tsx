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
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Your backlinks
      </h1>
      <p className="text-sm text-ink-soft">
        {backlinks?.length ?? 0} backlinks found
      </p>

      {!backlinks?.length && (
        <p className="text-sm text-ink-soft">
          No backlinks detected yet — checked daily once your pitches start
          getting picked up by journalists.
        </p>
      )}

      <ul className="space-y-2">
        {backlinks?.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-md border border-rule bg-surface p-4 text-sm"
          >
            <div>
              <a
                href={b.article_url}
                target="_blank"
                className="font-medium text-ink underline"
              >
                {b.outlet_domain}
              </a>
              <p className="text-ink-soft">
                Authority: {b.authority_score ?? "—"} ·{" "}
                {b.is_dofollow ? "dofollow" : "nofollow"} ·{" "}
                {new Date(b.first_seen_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 font-dispatch text-xs ${
                b.status === "live"
                  ? "bg-press/15 text-press"
                  : "bg-wire/15 text-wire"
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
