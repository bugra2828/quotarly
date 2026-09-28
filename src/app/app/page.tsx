import { createClient } from "@/lib/supabase/server";
import { toggleAutoApprove } from "@/app/actions/expert-profile";
import { getDashboardStats, type DateRange } from "@/lib/dashboard/stats";
import { computeTrend } from "@/lib/dashboard/trend";
import { PitchesBarChart, BacklinksAreaChart } from "./DashboardCharts";
import { redirect } from "next/navigation";
import Link from "next/link";

const RANGES: { value: DateRange; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: DateRange =
    rawRange === "week" || rawRange === "month" || rawRange === "all"
      ? rawRange
      : "week";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: expertProfiles } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("owner_id", user.id);

  const expertProfileIds = (expertProfiles ?? []).map((ep) => ep.id);

  const stats = await getDashboardStats(supabase, expertProfileIds, range);
  const pitchesTrend = computeTrend(stats.pitchesSent, stats.pitchesSentTrendBase);
  const backlinksTrend = computeTrend(
    stats.backlinksWon,
    stats.backlinksWonTrendBase
  );

  const [{ data: pendingPitches }, { data: recentSent }, { data: recentBacklinks }] =
    expertProfileIds.length > 0
      ? await Promise.all([
          supabase
            .from("pitches")
            .select("id, subject, created_at, matches(query_id, expert_profile_id, queries(title, outlet_name, deadline))")
            .in("expert_profile_id", expertProfileIds)
            .eq("status", "pending_approval")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("pitches")
            .select("id, subject, sent_at, matches(queries(outlet_name))")
            .in("expert_profile_id", expertProfileIds)
            .eq("status", "sent")
            .order("sent_at", { ascending: false })
            .limit(5),
          supabase
            .from("backlinks")
            .select("id, outlet_domain, article_url, authority_score, is_dofollow, status, first_seen_at")
            .in("expert_profile_id", expertProfileIds)
            .order("first_seen_at", { ascending: false })
            .limit(5),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <div className="flex rounded-full border border-rule p-1 text-sm">
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={`/app?range=${r.value}`}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors hover:opacity-90 ${
                range === r.value ? "bg-ink text-paper" : "text-ink-soft"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {!expertProfiles?.length ? (
        <div className="rounded-md border border-dashed border-rule p-6 text-center">
          <p className="mb-3 text-sm text-ink-soft">
            You haven&apos;t created an expert profile yet.
          </p>
          <Link
            href="/app/onboarding"
            className="inline-block rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            Create your profile
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatTile
              label="Pitches sent"
              value={stats.pitchesSent}
              trend={range === "all" ? null : pitchesTrend}
              href="/app/pitches"
            />
            <StatTile
              label="Backlinks won"
              value={stats.backlinksWon}
              trend={range === "all" ? null : backlinksTrend}
              href="/app/backlinks"
            />
            <StatTile
              label="Pending approvals"
              value={stats.pendingApprovals}
              href="/app/approvals"
            />
            <StatTile
              label="Avg. authority score"
              value={stats.avgAuthority ?? "—"}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-md border border-rule bg-surface p-5">
              <p className="text-sm font-medium text-ink">Pitches sent</p>
              <PitchesBarChart data={stats.pitchesPerDay} />
            </div>
            <div className="rounded-md border border-rule bg-surface p-5">
              <p className="text-sm font-medium text-ink">Backlinks won</p>
              <BacklinksAreaChart data={stats.backlinksPerDay} />
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Your profiles
            </h2>
            <ul className="mt-3 space-y-2">
              {expertProfiles.map((ep) => (
                <li
                  key={ep.id}
                  className="flex items-center justify-between rounded-md border border-rule bg-surface p-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{ep.display_name}</p>
                    <p className="text-ink-soft">
                      {ep.job_title} {ep.company ? `@ ${ep.company}` : ""}
                    </p>
                  </div>
                  <form action={toggleAutoApprove}>
                    <input type="hidden" name="expert_profile_id" value={ep.id} />
                    <input
                      type="hidden"
                      name="next_value"
                      value={(!ep.auto_approve).toString()}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        ep.auto_approve
                          ? "bg-press/15 text-press"
                          : "bg-wire/15 text-wire"
                      }`}
                    >
                      {ep.auto_approve
                        ? "Auto-send is on (switch to manual)"
                        : "Manual review is on (switch to auto)"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Pending approvals
                </h2>
                <Link href="/app/approvals" className="rounded-full border border-brand/40 px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10">
                  View all →
                </Link>
              </div>
              {!pendingPitches?.length ? (
                <p className="mt-3 text-sm text-ink-soft">
                  Nothing waiting — everything clearing your bar sends on its
                  own.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {pendingPitches.map((p) => {
                    const match = Array.isArray(p.matches) ? p.matches[0] : p.matches;
                    const query = match?.queries
                      ? Array.isArray(match.queries)
                        ? match.queries[0]
                        : match.queries
                      : null;
                    return (
                      <li
                        key={p.id}
                        className="rounded-md border border-rule bg-surface p-3 text-sm"
                      >
                        <p className="font-medium text-ink">{p.subject}</p>
                        <p className="text-xs text-ink-soft">
                          {query?.outlet_name ?? "Unknown outlet"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Recently sent
                </h2>
                <Link href="/app/pitches" className="rounded-full border border-brand/40 px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10">
                  View all →
                </Link>
              </div>
              {!recentSent?.length ? (
                <p className="mt-3 text-sm text-ink-soft">
                  No pitches sent yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {recentSent.map((p) => {
                    const match = Array.isArray(p.matches) ? p.matches[0] : p.matches;
                    const query = match?.queries
                      ? Array.isArray(match.queries)
                        ? match.queries[0]
                        : match.queries
                      : null;
                    return (
                      <li
                        key={p.id}
                        className="rounded-md border border-rule bg-surface p-3 text-sm"
                      >
                        <p className="font-medium text-ink">{p.subject}</p>
                        <p className="text-xs text-ink-soft">
                          {query?.outlet_name ?? "Unknown outlet"} ·{" "}
                          {p.sent_at
                            ? new Date(p.sent_at).toLocaleDateString()
                            : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Recent backlinks
              </h2>
              <Link href="/app/backlinks" className="rounded-full border border-brand/40 px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10">
                View all →
              </Link>
            </div>
            {!recentBacklinks?.length ? (
              <p className="mt-3 text-sm text-ink-soft">
                No backlinks detected yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentBacklinks.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-md border border-rule bg-surface p-3 text-sm"
                  >
                    <div>
                      <a
                        href={b.article_url}
                        target="_blank"
                        className="font-medium text-ink underline"
                      >
                        {b.outlet_domain}
                      </a>
                      <p className="text-xs text-ink-soft">
                        Authority {b.authority_score ?? "—"} ·{" "}
                        {b.is_dofollow ? "dofollow" : "nofollow"}
                      </p>
                    </div>
                    <span
                      className={`font-dispatch rounded-full px-2.5 py-0.5 text-xs ${
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
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  trend,
  href,
}: {
  label: string;
  value: number | string;
  trend?: { percent: number | null; direction: "up" | "down" | "flat" } | null;
  href?: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="btn-raised-brand block rounded-md bg-brand p-5 transition-colors duration-100 hover:bg-brand/90"
      >
        <p className="font-display text-2xl font-semibold text-white">
          {value}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <p className="text-sm font-semibold text-white/85">{label}</p>
          {trend && trend.percent !== null && (
            <span
              className={`text-xs font-medium ${
                trend.direction === "up" ? "text-press" : "text-white/70"
              }`}
            >
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : ""}
              {Math.abs(trend.percent)}%
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-md border border-rule bg-paper p-5">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        {trend && trend.percent !== null && (
          <span
            className={`text-xs font-medium ${
              trend.direction === "up" ? "text-press" : "text-ink-soft"
            }`}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : ""}
            {Math.abs(trend.percent)}%
          </span>
        )}
      </div>
    </div>
  );
}
