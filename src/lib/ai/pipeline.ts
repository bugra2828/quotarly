import { createAdminClient } from "@/lib/supabase/admin";
import { matchQueryToProfile, quickKeywordOverlap } from "@/lib/ai/matcher";
import { writePitch } from "@/lib/ai/writer";

// Runs the matcher + writer for a batch of newly-inserted queries against every
// active expert profile. Called right after the inbound webhook parses a
// newsletter. Best-effort: one profile/query failing doesn't block the rest.
export async function runMatchingForQueries(queryIds: string[]) {
  if (queryIds.length === 0) return;

  const supabase = createAdminClient();

  const [{ data: queries }, { data: profiles }] = await Promise.all([
    supabase.from("queries").select("*").in("id", queryIds),
    supabase.from("expert_profiles").select("*").eq("active", true),
  ]);

  if (!queries?.length || !profiles?.length) return;

  for (const query of queries) {
    if (query.deadline && new Date(query.deadline) < new Date()) continue;

    const queryText = `${query.title}\n\n${query.body}`;

    for (const profile of profiles) {
      if (!quickKeywordOverlap(queryText, profile.expertise_topics ?? [])) {
        continue;
      }

      try {
        const result = await matchQueryToProfile(queryText, {
          display_name: profile.display_name,
          job_title: profile.job_title,
          company: profile.company,
          bio: profile.bio,
          expertise_topics: profile.expertise_topics ?? [],
          excluded_topics: profile.excluded_topics ?? [],
        });

        if (result.score < (profile.min_match_score ?? 70)) continue;

        const { data: match, error: matchError } = await supabase
          .from("matches")
          .insert({
            query_id: query.id,
            expert_profile_id: profile.id,
            score: result.score,
            reasoning: result.reasoning,
          })
          .select()
          .single();

        if (matchError || !match) continue;

        const pitch = await writePitch(queryText, query.requirements, {
          display_name: profile.display_name,
          job_title: profile.job_title,
          company: profile.company,
          tone: profile.tone,
          sample_quotes: profile.sample_quotes ?? [],
          website_url: profile.website_url,
        });

        await supabase.from("pitches").insert({
          match_id: match.id,
          expert_profile_id: profile.id,
          subject: pitch.subject,
          body: pitch.body,
          status: "pending_approval",
        });
      } catch {
        // Best-effort — one bad match/pitch shouldn't break the batch.
        continue;
      }
    }
  }
}
