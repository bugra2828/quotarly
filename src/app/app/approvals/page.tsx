import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { approvePitch, rejectPitch } from "@/app/actions/pitches";
import { redirect } from "next/navigation";

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*, matches(query_id, score, reasoning, expert_profiles(display_name))")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  const queryIds = [
    ...new Set(
      (pitches ?? [])
        .map((p) => {
          const m = Array.isArray(p.matches) ? p.matches[0] : p.matches;
          return m?.query_id;
        })
        .filter(Boolean)
    ),
  ] as string[];

  // "queries" is admin/service-only at the RLS layer. Safe here: every id in
  // queryIds came from a match on a pitch this user already owns (via RLS
  // above), so we're only ever fetching questions relevant to their pitches.
  const admin = createAdminClient();
  const { data: queries } =
    queryIds.length > 0
      ? await admin
          .from("queries")
          .select("id, title, body, outlet_name, requirements, deadline")
          .in("id", queryIds)
      : { data: [] };

  const queryById = new Map((queries ?? []).map((q) => [q.id, q]));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-xl font-semibold">Pending approvals</h1>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!pitches?.length && (
        <p className="text-sm text-muted-foreground">
          Nothing waiting for your approval right now.
        </p>
      )}

      <ul className="space-y-6">
        {pitches?.map((p) => {
          const match = Array.isArray(p.matches) ? p.matches[0] : p.matches;
          const query = match ? queryById.get(match.query_id) : null;
          const hasVerify = p.body.includes("[VERIFY");
          const deadlinePassed =
            query?.deadline && new Date(query.deadline) < new Date();

          return (
            <li key={p.id} className="space-y-3 rounded-lg border p-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Journalist question {query?.outlet_name ? `— ${query.outlet_name}` : ""}
                </p>
                <p className="font-medium">{query?.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {query?.body}
                </p>
                {query?.deadline && (
                  <p
                    className={`mt-1 text-xs ${
                      deadlinePassed ? "text-red-600" : "text-muted-foreground"
                    }`}
                  >
                    Deadline: {new Date(query.deadline).toLocaleString()}
                    {deadlinePassed ? " (passed)" : ""}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Your draft (match score: {match?.score})
                </p>
                <form action={approvePitch} className="mt-2 space-y-2">
                  <input type="hidden" name="pitch_id" value={p.id} />
                  <input
                    type="text"
                    defaultValue={p.subject}
                    disabled
                    className="w-full rounded-md border bg-muted px-3 py-2 text-sm"
                  />
                  <textarea
                    name="body"
                    defaultValue={p.body}
                    rows={8}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                  {hasVerify && (
                    <p className="text-xs text-amber-700">
                      This draft has [VERIFY: ...] placeholders — edit them
                      out before you can send.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!!deadlinePassed}
                      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Approve & send
                    </button>
                  </div>
                </form>
                <form action={rejectPitch} className="mt-2">
                  <input type="hidden" name="pitch_id" value={p.id} />
                  <button
                    type="submit"
                    className="text-sm text-muted-foreground underline"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
