import { createAdminClient } from "@/lib/supabase/admin";
import { fetchLiveBacklinks } from "@/lib/dataforseo/client";
import { sendNewBacklinkNotification } from "@/lib/email/notify";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

// Runs daily (Vercel Cron). For every active expert profile, pulls the
// current set of live backlinks to their target domain, records new ones,
// and marks previously-seen ones as live/lost based on whether they're
// still present. Spec 9.5.
export async function trackBacklinksForAllProfiles() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("expert_profiles")
    .select("id, owner_id, target_url")
    .eq("active", true)
    .not("target_url", "is", null);

  if (!profiles?.length) return { profiles_checked: 0, new_backlinks: 0 };

  let newBacklinksCount = 0;

  for (const profile of profiles) {
    const domain = extractDomain(profile.target_url!);

    let liveItems;
    try {
      liveItems = await fetchLiveBacklinks(domain);
    } catch {
      continue; // best-effort — one profile's API failure shouldn't block others
    }

    const liveUrls = new Set(liveItems.map((i) => i.url_from));

    const { data: existing } = await supabase
      .from("backlinks")
      .select("id, article_url, status")
      .eq("expert_profile_id", profile.id);

    const existingByUrl = new Map((existing ?? []).map((b) => [b.article_url, b]));

    // Mark backlinks no longer present as lost, and previously-lost ones
    // that reappeared as live again.
    for (const row of existing ?? []) {
      const stillLive = liveUrls.has(row.article_url);
      const nextStatus = stillLive ? "live" : "lost";
      if (nextStatus !== row.status) {
        await supabase
          .from("backlinks")
          .update({ status: nextStatus, verified_at: new Date().toISOString() })
          .eq("id", row.id);
      }
    }

    // Insert genuinely new backlinks and notify the client.
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", profile.owner_id)
      .single();

    for (const item of liveItems) {
      if (existingByUrl.has(item.url_from)) continue;

      await supabase.from("backlinks").insert({
        expert_profile_id: profile.id,
        article_url: item.url_from,
        outlet_domain: item.domain_from,
        target_url: item.url_to,
        anchor_text: item.anchor,
        is_dofollow: item.dofollow,
        authority_score: item.rank,
        first_seen_at: item.first_seen ?? new Date().toISOString(),
        verified_at: new Date().toISOString(),
        status: "live",
      });

      newBacklinksCount++;

      if (ownerProfile?.email) {
        await sendNewBacklinkNotification({
          toEmail: ownerProfile.email,
          outletDomain: item.domain_from,
          articleUrl: item.url_from,
          authorityScore: item.rank,
        }).catch(() => {});
      }
    }
  }

  return { profiles_checked: profiles.length, new_backlinks: newBacklinksCount };
}
