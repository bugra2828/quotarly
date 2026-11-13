import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchLiveBacklinks, searchGoogle } from "@/lib/dataforseo/client";
import { sendNewBacklinkNotification } from "@/lib/email/notify";
import { checkArticleLink, isSameSite, normalizeDomain } from "@/lib/backlinks/verify";

// A pitch can turn into a published link this long after it was sent.
const PITCH_WINDOW_DAYS = 120;
// Pitches this recent are also searched for on Google, which finds articles
// days or weeks before the backlink index does.
const SEARCH_WINDOW_DAYS = 45;
// Consecutive "link not on the page" checks before a link counts as lost.
const LOST_AFTER_MISSING_CHECKS = 3;
// Allow for clock skew and timezone noise between a pitch and an index date.
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type ExpertProfile = {
  id: string;
  owner_id: string;
  display_name: string;
  target_url: string;
  backlinks_baselined_at: string | null;
};

type PitchedOutlet = { domain: string; pitchId: string; sentAt: Date };

type ExistingLink = {
  id: string;
  article_url: string;
  origin: "quotarly" | "preexisting" | "other";
  status: "live" | "lost";
  missing_checks: number;
};

export type ScanResult = { baselined: boolean; newBacklinks: number; rechecked: number };

// Runs daily (Vercel Cron) for every active expert profile.
export async function trackBacklinksForAllProfiles() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("expert_profiles")
    .select("id, owner_id, display_name, target_url, backlinks_baselined_at")
    .eq("active", true)
    .not("target_url", "is", null);

  let newBacklinks = 0;
  let failed = 0;
  for (const profile of (profiles ?? []) as ExpertProfile[]) {
    try {
      newBacklinks += (await scanProfileBacklinks(supabase, profile)).newBacklinks;
    } catch (err) {
      // Best-effort: one profile's failure shouldn't block the others.
      failed++;
      console.error("backlink scan failed", profile.id, err);
    }
  }

  return { profiles_checked: profiles?.length ?? 0, new_backlinks: newBacklinks, failed };
}

/**
 * Finds backlinks Quotarly earned for one expert profile and re-checks the
 * ones already recorded. Only links on an outlet we pitched, first seen after
 * the pitch went out, count as Quotarly links.
 *
 * The first scan of a profile only records its existing backlinks as the
 * baseline, so links the customer already had are never counted or emailed.
 */
export async function scanProfileBacklinks(
  supabase: SupabaseClient,
  profile: ExpertProfile,
  options: { notify?: boolean } = {},
): Promise<ScanResult> {
  const notify = options.notify ?? true;
  const domain = normalizeDomain(profile.target_url);

  if (!profile.backlinks_baselined_at) {
    await recordBaseline(supabase, profile, domain);
    return { baselined: true, newBacklinks: 0, rechecked: 0 };
  }

  const [outlets, existing] = await Promise.all([
    getPitchedOutlets(supabase, profile.id),
    getExistingLinks(supabase, profile.id),
  ]);
  const known = new Set(existing.map((l) => l.article_url));

  const candidates = new Map<string, { outlet: PitchedOutlet; indexed?: IndexedLink }>();
  if (outlets.length > 0) {
    await collectFromIndex(domain, outlets, known, candidates);
    await collectFromSearch(domain, profile, outlets, existing, known, candidates);
  }

  let newBacklinks = 0;
  for (const [articleUrl, { outlet, indexed }] of candidates) {
    const check = await checkArticleLink(articleUrl, domain);

    // Our own fetch is the source of truth. If the page blocks us, fall back
    // to what the backlink index saw; a search hit alone isn't enough.
    let dofollow: boolean | null;
    let anchor: string | null;
    if (check.status === "linked") {
      dofollow = check.dofollow;
      anchor = check.anchor;
    } else if (indexed) {
      dofollow = indexed.dofollow;
      anchor = indexed.anchor;
    } else {
      continue;
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("backlinks").insert({
      expert_profile_id: profile.id,
      pitch_id: outlet.pitchId,
      origin: "quotarly",
      article_url: articleUrl,
      outlet_domain: normalizeDomain(new URL(articleUrl).hostname),
      target_url: indexed?.url_to ?? profile.target_url,
      anchor_text: anchor,
      is_dofollow: dofollow,
      authority_score: indexed?.rank ?? null,
      first_seen_at: earliest(indexed?.first_seen, now),
      verified_at: now,
      last_checked_at: now,
      status: "live",
    });
    if (error) continue; // e.g. a concurrent run inserted it first
    newBacklinks++;

    if (notify) {
      const email = await getOwnerEmail(supabase, profile.owner_id);
      if (email) {
        await sendNewBacklinkNotification({
          toEmail: email,
          outletDomain: normalizeDomain(new URL(articleUrl).hostname),
          articleUrl,
          authorityScore: indexed?.rank ?? null,
        }).catch(() => {});
      }
    }
  }

  const rechecked = await recheckQuotarlyLinks(supabase, domain, existing);
  return { baselined: false, newBacklinks, rechecked };
}

type IndexedLink = Awaited<ReturnType<typeof fetchLiveBacklinks>>[number];

async function recordBaseline(supabase: SupabaseClient, profile: ExpertProfile, domain: string) {
  const items = await fetchLiveBacklinks(domain);
  const now = new Date().toISOString();

  if (items.length > 0) {
    const { error } = await supabase.from("backlinks").upsert(
      items.map((item) => ({
        expert_profile_id: profile.id,
        origin: "preexisting",
        article_url: item.url_from,
        outlet_domain: item.domain_from,
        target_url: item.url_to,
        anchor_text: item.anchor,
        is_dofollow: item.dofollow,
        authority_score: item.rank,
        first_seen_at: item.first_seen ?? now,
        verified_at: now,
        status: "live",
      })),
      { onConflict: "expert_profile_id,article_url", ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  const { error } = await supabase
    .from("expert_profiles")
    .update({ backlinks_baselined_at: now })
    .eq("id", profile.id);
  if (error) throw error;
}

// Outlets this profile pitched recently, one entry per outlet domain (the
// earliest pitch, since a link can't predate the first pitch to that outlet).
async function getPitchedOutlets(supabase: SupabaseClient, profileId: string): Promise<PitchedOutlet[]> {
  const since = new Date(Date.now() - PITCH_WINDOW_DAYS * ONE_DAY_MS).toISOString();
  const { data, error } = await supabase
    .from("pitches")
    .select("id, sent_at, matches!inner(queries!inner(outlet_domain))")
    .eq("expert_profile_id", profileId)
    .eq("status", "sent")
    .gte("sent_at", since)
    .order("sent_at", { ascending: true });
  if (error) throw error;

  const byDomain = new Map<string, PitchedOutlet>();
  for (const row of data ?? []) {
    const match = row.matches as unknown as { queries: { outlet_domain: string | null } };
    const raw = match?.queries?.outlet_domain;
    if (!raw || !row.sent_at) continue;
    const domain = normalizeDomain(raw);
    if (!byDomain.has(domain)) {
      byDomain.set(domain, { domain, pitchId: row.id, sentAt: new Date(row.sent_at) });
    }
  }
  return [...byDomain.values()];
}

async function getExistingLinks(supabase: SupabaseClient, profileId: string): Promise<ExistingLink[]> {
  const { data, error } = await supabase
    .from("backlinks")
    .select("id, article_url, origin, status, missing_checks")
    .eq("expert_profile_id", profileId);
  if (error) throw error;
  return (data ?? []) as ExistingLink[];
}

function findOutlet(host: string, outlets: PitchedOutlet[]): PitchedOutlet | undefined {
  return outlets.find((o) => isSameSite(host, o.domain));
}

// Backlink index: new links to the customer's site, kept only when they're on
// an outlet we pitched and appeared after that pitch.
async function collectFromIndex(
  domain: string,
  outlets: PitchedOutlet[],
  known: Set<string>,
  candidates: Map<string, { outlet: PitchedOutlet; indexed?: IndexedLink }>,
) {
  const earliestPitch = Math.min(...outlets.map((o) => o.sentAt.getTime()));
  const items = await fetchLiveBacklinks(domain, {
    firstSeenAfter: new Date(earliestPitch - ONE_DAY_MS),
  });

  for (const item of items) {
    if (known.has(item.url_from) || candidates.has(item.url_from)) continue;
    const outlet = findOutlet(item.domain_from, outlets);
    if (!outlet) continue;
    if (item.first_seen && new Date(item.first_seen).getTime() < outlet.sentAt.getTime() - ONE_DAY_MS) {
      continue;
    }
    candidates.set(item.url_from, { outlet, indexed: item });
  }
}

// Google: "site:outlet.com" plus the expert's name or site, for recent pitches
// whose outlet hasn't produced a Quotarly link yet.
async function collectFromSearch(
  domain: string,
  profile: ExpertProfile,
  outlets: PitchedOutlet[],
  existing: ExistingLink[],
  known: Set<string>,
  candidates: Map<string, { outlet: PitchedOutlet; indexed?: IndexedLink }>,
) {
  const searchSince = Date.now() - SEARCH_WINDOW_DAYS * ONE_DAY_MS;
  const linkedOutlets = existing
    .filter((l) => l.origin === "quotarly")
    .map((l) => normalizeDomain(new URL(l.article_url).hostname));

  for (const outlet of outlets) {
    if (outlet.sentAt.getTime() < searchSince) continue;
    if (linkedOutlets.some((host) => isSameSite(host, outlet.domain))) continue;

    const name = profile.display_name.replace(/"/g, "").trim();
    let urls: string[];
    try {
      urls = await searchGoogle(`site:${outlet.domain} ("${name}" OR "${domain}")`);
    } catch (err) {
      console.error("backlink search failed", outlet.domain, err);
      continue;
    }

    for (const url of urls) {
      if (known.has(url) || candidates.has(url)) continue;
      let host: string;
      try {
        host = new URL(url).hostname;
      } catch {
        continue;
      }
      if (isSameSite(host, outlet.domain)) candidates.set(url, { outlet });
    }
  }
}

// Re-fetches every Quotarly link. Lost only after several fetches in a row
// found the page without the link; a blocked or failed fetch changes nothing.
async function recheckQuotarlyLinks(
  supabase: SupabaseClient,
  domain: string,
  existing: ExistingLink[],
): Promise<number> {
  let rechecked = 0;
  for (const link of existing.filter((l) => l.origin === "quotarly")) {
    const check = await checkArticleLink(link.article_url, domain);
    if (check.status === "unreachable") continue;

    const now = new Date().toISOString();
    if (check.status === "linked") {
      await supabase
        .from("backlinks")
        .update({
          status: "live",
          is_dofollow: check.dofollow,
          missing_checks: 0,
          verified_at: now,
          last_checked_at: now,
        })
        .eq("id", link.id);
    } else {
      const missing = link.missing_checks + 1;
      await supabase
        .from("backlinks")
        .update({
          missing_checks: missing,
          status: missing >= LOST_AFTER_MISSING_CHECKS ? "lost" : link.status,
          last_checked_at: now,
        })
        .eq("id", link.id);
    }
    rechecked++;
  }
  return rechecked;
}

async function getOwnerEmail(supabase: SupabaseClient, ownerId: string): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("email").eq("id", ownerId).single();
  return data?.email ?? null;
}

function earliest(a: string | null | undefined, b: string): string {
  if (!a) return b;
  return new Date(a).getTime() < new Date(b).getTime() ? a : b;
}
