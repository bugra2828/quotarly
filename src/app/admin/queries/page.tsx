import { createClient } from "@/lib/supabase/server";

export default async function AdminQueriesPage() {
  const supabase = await createClient();

  const { data: queries } = await supabase
    .from("queries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Journalist queries
      </h1>
      <p className="text-sm text-ink-soft">
        {queries?.length ?? 0} parsed queries
      </p>

      <ul className="space-y-3">
        {queries?.map((q) => (
          <li key={q.id} className="rounded-md border border-rule bg-surface p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{q.title || "(untitled)"}</span>
              <span className="font-dispatch rounded-full bg-brand/15 px-2.5 py-0.5 text-xs text-brand">
                {q.source}
              </span>
            </div>
            {q.outlet_name && (
              <p className="text-ink-soft">
                {q.outlet_name}
                {q.journalist_name ? ` — ${q.journalist_name}` : ""}
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-ink-soft">{q.body}</p>
            {q.requirements && (
              <p className="mt-2 text-ink-soft">
                <span className="font-medium text-ink">Requirements:</span>{" "}
                {q.requirements}
              </p>
            )}
            {q.deadline && (
              <p className="mt-1 font-dispatch text-xs text-ink-soft">
                Deadline: {new Date(q.deadline).toLocaleString("en-GB")}
              </p>
            )}
          </li>
        ))}
      </ul>

      {!queries?.length && (
        <p className="text-sm text-ink-soft">
          No queries yet — waiting for the first inbound newsletter.
        </p>
      )}
    </div>
  );
}
