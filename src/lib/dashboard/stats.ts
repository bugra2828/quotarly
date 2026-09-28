import type { createAdminClient } from "@/lib/supabase/admin";

type SupabaseLike = ReturnType<typeof createAdminClient>;

export type DateRange = "week" | "month" | "all";

export function rangeToDays(range: DateRange): number | null {
  if (range === "week") return 7;
  if (range === "month") return 30;
  return null;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function buildDayBuckets(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export type DashboardStats = {
  pitchesSent: number;
  pitchesSentTrendBase: number;
  backlinksWon: number;
  backlinksWonTrendBase: number;
  pendingApprovals: number;
  avgAuthority: number | null;
  pitchesPerDay: { date: string; count: number }[];
  backlinksPerDay: { date: string; count: number }[];
};

export async function getDashboardStats(
  supabase: SupabaseLike,
  expertProfileIds: string[],
  range: DateRange
): Promise<DashboardStats> {
  if (expertProfileIds.length === 0) {
    return {
      pitchesSent: 0,
      pitchesSentTrendBase: 0,
      backlinksWon: 0,
      backlinksWonTrendBase: 0,
      pendingApprovals: 0,
      avgAuthority: null,
      pitchesPerDay: [],
      backlinksPerDay: [],
    };
  }

  const days = rangeToDays(range);
  const now = new Date();
  const start = days ? daysAgo(days - 1) : daysAgo(3650); // "all" = generous lookback
  const prevStart = days ? daysAgo(days * 2 - 1) : start;
  const prevEnd = days ? daysAgo(days) : start;

  const [
    { data: sentRows },
    { count: prevSentCount },
    { data: backlinkRows },
    { count: prevBacklinkCount },
    { count: pendingApprovals },
  ] = await Promise.all([
    supabase
      .from("pitches")
      .select("sent_at")
      .in("expert_profile_id", expertProfileIds)
      .eq("status", "sent")
      .gte("sent_at", start.toISOString()),
    days
      ? supabase
          .from("pitches")
          .select("*", { count: "exact", head: true })
          .in("expert_profile_id", expertProfileIds)
          .eq("status", "sent")
          .gte("sent_at", prevStart.toISOString())
          .lt("sent_at", prevEnd.toISOString())
      : Promise.resolve({ count: 0 }),
    supabase
      .from("backlinks")
      .select("first_seen_at, authority_score")
      .in("expert_profile_id", expertProfileIds)
      .gte("first_seen_at", start.toISOString()),
    days
      ? supabase
          .from("backlinks")
          .select("*", { count: "exact", head: true })
          .in("expert_profile_id", expertProfileIds)
          .gte("first_seen_at", prevStart.toISOString())
          .lt("first_seen_at", prevEnd.toISOString())
      : Promise.resolve({ count: 0 }),
    supabase
      .from("pitches")
      .select("*", { count: "exact", head: true })
      .in("expert_profile_id", expertProfileIds)
      .eq("status", "pending_approval"),
  ]);

  const buckets = buildDayBuckets(start, now);
  const pitchCountByDay = new Map(buckets.map((d) => [d, 0]));
  for (const row of sentRows ?? []) {
    if (!row.sent_at) continue;
    const key = dayKey(row.sent_at);
    if (pitchCountByDay.has(key)) {
      pitchCountByDay.set(key, (pitchCountByDay.get(key) ?? 0) + 1);
    }
  }

  const backlinkCountByDay = new Map(buckets.map((d) => [d, 0]));
  for (const row of backlinkRows ?? []) {
    const key = dayKey(row.first_seen_at);
    if (backlinkCountByDay.has(key)) {
      backlinkCountByDay.set(key, (backlinkCountByDay.get(key) ?? 0) + 1);
    }
  }

  const scores = (backlinkRows ?? [])
    .map((b) => b.authority_score)
    .filter((s): s is number => typeof s === "number");
  const avgAuthority =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  return {
    pitchesSent: sentRows?.length ?? 0,
    pitchesSentTrendBase: prevSentCount ?? 0,
    backlinksWon: backlinkRows?.length ?? 0,
    backlinksWonTrendBase: prevBacklinkCount ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    avgAuthority,
    pitchesPerDay: buckets.map((date) => ({
      date,
      count: pitchCountByDay.get(date) ?? 0,
    })),
    backlinksPerDay: buckets.map((date) => ({
      date,
      count: backlinkCountByDay.get(date) ?? 0,
    })),
  };
}
