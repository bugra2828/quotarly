import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminQueriesPage() {
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

  const { data: queries } = await supabase
    .from("queries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Journalist queries</h1>
      <p className="text-sm text-muted-foreground">
        {queries?.length ?? 0} parsed queries
      </p>

      <ul className="space-y-3">
        {queries?.map((q) => (
          <li key={q.id} className="rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{q.title || "(untitled)"}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                {q.source}
              </span>
            </div>
            {q.outlet_name && (
              <p className="text-muted-foreground">
                {q.outlet_name}
                {q.journalist_name ? ` — ${q.journalist_name}` : ""}
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap">{q.body}</p>
            {q.requirements && (
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium">Requirements:</span>{" "}
                {q.requirements}
              </p>
            )}
            {q.deadline && (
              <p className="mt-1 text-xs text-muted-foreground">
                Deadline: {new Date(q.deadline).toLocaleString()}
              </p>
            )}
          </li>
        ))}
      </ul>

      {!queries?.length && (
        <p className="text-sm text-muted-foreground">
          No queries yet — waiting for the first inbound newsletter.
        </p>
      )}
    </div>
  );
}
