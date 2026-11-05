import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { approvePitch, rejectPitch } from "@/app/actions/pitches";
import { groupByMonth, parseMonthKey } from "@/lib/pitches/months";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; month?: string }>;
}) {
  const { error, month: monthParam } = await searchParams;

  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const month = parseMonthKey(monthParam);

  if (!month) {
    const { data: pending, error: monthsError } = await supabase
      .from("pitches")
      .select("created_at")
      .eq("status", "pending_approval");

    const months = groupByMonth((pending ?? []).map((p) => p.created_at));

    return (
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Pending approvals
        </h1>

        {error && (
          <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
            {error}
          </p>
        )}

        {monthsError ? (
          <p className="text-sm text-wire">
            Couldn&apos;t load your approvals — try refreshing.
          </p>
        ) : (
          !months.length && (
            <p className="text-sm text-ink-soft">
              Nothing waiting for your approval right now.
            </p>
          )
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {months.map((m) => (
            <li key={m.key}>
              <Link
                href={`/app/approvals?month=${m.key}`}
                prefetch={false}
                className="flex items-center justify-between gap-4 rounded-md border border-rule bg-surface p-5 transition-colors hover:border-ink/40"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{m.label}</p>
                  <p className="mt-0.5 font-dispatch text-xs text-ink-soft">
                    {m.count} waiting
                  </p>
                </div>
                <span className="shrink-0 text-ink-soft" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { data: pitches, error: queryError } = await supabase
    .from("pitches")
    .select("*, matches(query_id, score, reasoning, expert_profiles(display_name))")
    .eq("status", "pending_approval")
    .gte("created_at", month.start.toISOString())
    .lt("created_at", month.end.toISOString())
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
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <div>
        <Link
          href="/app/approvals"
          className="text-sm text-ink-soft underline hover:text-ink"
        >
          ← All months
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          Pending approvals · {month.label}
        </h1>
      </div>

      {error && (
        <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
          {error}
        </p>
      )}

      {queryError ? (
        <p className="text-sm text-wire">
          Couldn&apos;t load your approvals — try refreshing.
        </p>
      ) : (
        !pitches?.length && (
          <p className="text-sm text-ink-soft">
            Nothing waiting for your approval in {month.label}.
          </p>
        )
      )}

      <ul className="space-y-3">
        {pitches?.map((p) => {
          const match = Array.isArray(p.matches) ? p.matches[0] : p.matches;
          const query = match ? queryById.get(match.query_id) : null;
          const hasVerify = p.body.includes("[VERIFY");
          const deadlinePassed =
            query?.deadline && new Date(query.deadline) < new Date();

          return (
            <li key={p.id}>
              <details className="group rounded-md border border-rule bg-surface open:pb-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {query?.title ?? p.subject}
                    </p>
                    <p className="mt-0.5 font-dispatch text-xs text-ink-soft">
                      {query?.outlet_name ? `${query.outlet_name} · ` : ""}
                      Arrived {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink-soft transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>

                <div className="space-y-4 border-t border-rule px-4 pt-4">
                  <div>
                    <p className="font-dispatch text-xs text-ink-soft">
                      Journalist question
                      {query?.outlet_name ? ` — ${query.outlet_name}` : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">
                      {query?.body}
                    </p>
                    {query?.deadline && (
                      <p
                        className={`mt-2 font-dispatch text-xs ${
                          deadlinePassed ? "text-wire" : "text-ink-soft"
                        }`}
                      >
                        Deadline: {new Date(query.deadline).toLocaleString("en-GB")}
                        {deadlinePassed ? " (passed)" : ""}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-dispatch text-xs text-ink-soft">
                      Your draft (match score: {match?.score})
                    </p>
                    <form action={approvePitch} className="mt-2 space-y-2">
                      <input type="hidden" name="pitch_id" value={p.id} />
                      <input type="hidden" name="month" value={month.key} />
                      <input
                        type="text"
                        defaultValue={p.subject}
                        disabled
                        className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink-soft"
                      />
                      <textarea
                        name="body"
                        defaultValue={p.body}
                        rows={8}
                        className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
                      />
                      {hasVerify && (
                        <p className="text-xs text-wire">
                          This draft has [VERIFY: ...] placeholders — edit
                          them out before you can send.
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!!deadlinePassed}
                          className="rounded-full bg-brand-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90 disabled:opacity-50"
                        >
                          Approve & send
                        </button>
                      </div>
                    </form>
                    <form action={rejectPitch} className="mt-2">
                      <input type="hidden" name="pitch_id" value={p.id} />
                      <button
                        type="submit"
                        className="text-sm text-ink-soft underline hover:text-ink"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
