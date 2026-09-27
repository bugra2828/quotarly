import type { createAdminClient } from "@/lib/supabase/admin";

type SupabaseLike = ReturnType<typeof createAdminClient>;

export type MonthlyStats = {
  expertName: string;
  month: string;
  pitchesSent: number;
  backlinksWon: number;
  avgAuthority: number | null;
  backlinks: {
    outletDomain: string;
    articleUrl: string;
    authorityScore: number | null;
    isDofollow: boolean;
    firstSeenAt: string;
  }[];
};

export function monthRange(month: string) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

export async function getMonthlyStats(
  supabase: SupabaseLike,
  expertProfileId: string,
  month: string
): Promise<MonthlyStats | null> {
  const { start, end } = monthRange(month);

  const { data: expertProfile } = await supabase
    .from("expert_profiles")
    .select("display_name")
    .eq("id", expertProfileId)
    .single();

  if (!expertProfile) return null;

  const { count: pitchesSent } = await supabase
    .from("pitches")
    .select("*", { count: "exact", head: true })
    .eq("expert_profile_id", expertProfileId)
    .eq("status", "sent")
    .gte("sent_at", start.toISOString())
    .lt("sent_at", end.toISOString());

  const { data: backlinks } = await supabase
    .from("backlinks")
    .select("outlet_domain, article_url, authority_score, is_dofollow, first_seen_at")
    .eq("expert_profile_id", expertProfileId)
    .gte("first_seen_at", start.toISOString())
    .lt("first_seen_at", end.toISOString())
    .order("first_seen_at", { ascending: false });

  const scores = (backlinks ?? [])
    .map((b) => b.authority_score)
    .filter((s): s is number => typeof s === "number");
  const avgAuthority =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  return {
    expertName: expertProfile.display_name,
    month,
    pitchesSent: pitchesSent ?? 0,
    backlinksWon: backlinks?.length ?? 0,
    avgAuthority,
    backlinks: (backlinks ?? []).map((b) => ({
      outletDomain: b.outlet_domain,
      articleUrl: b.article_url,
      authorityScore: b.authority_score,
      isDofollow: b.is_dofollow,
      firstSeenAt: b.first_seen_at,
    })),
  };
}
