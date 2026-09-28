import { createAdminClient } from "@/lib/supabase/admin";
import { matchQueryToProfile, quickKeywordOverlap } from "@/lib/ai/matcher";
import { writePitch } from "@/lib/ai/writer";
import { sendPendingApprovalNotification } from "@/lib/email/notify";
import { attemptSendPitch } from "@/lib/pitches/send";

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

  const ownerEmailByProfileId = new Map<string, string>();

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

        const { data: newPitch } = await supabase
          .from("pitches")
          .insert({
            match_id: match.id,
            expert_profile_id: profile.id,
            subject: pitch.subject,
            body: pitch.body,
            status: "pending_approval",
          })
          .select()
          .single();

        if (!newPitch) continue;

        let ownerEmail = ownerEmailByProfileId.get(profile.id);
        if (ownerEmail === undefined) {
          const { data: ownerProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", profile.owner_id)
            .single();
          ownerEmail = String(ownerProfile?.email ?? "");
          ownerEmailByProfileId.set(profile.id, ownerEmail);
        }

        let stillPending = true;

        if (profile.auto_approve) {
          const sendResult = await attemptSendPitch({
            supabase,
            pitchId: newPitch.id,
            expertProfileId: profile.id,
            expertDisplayName: profile.display_name,
            subject: pitch.subject,
            body: pitch.body,
            replyEmail: query.reply_email,
            deadline: query.deadline,
            ownerEmail,
          });

          // Only the reasons below leave the pitch sitting in
          // pending_approval — deadline_passed/send_failed already moved it
          // to expired/failed inside attemptSendPitch, so there's nothing
          // left to notify about.
          stillPending =
            !sendResult.ok &&
            (sendResult.reason === "verify_tag" ||
              sendResult.reason === "daily_limit" ||
              sendResult.reason === "missing_reply_email");
        }

        if (stillPending && ownerEmail) {
          await sendPendingApprovalNotification({
            toEmail: ownerEmail,
            outletName: query.outlet_name,
            queryTitle: query.title,
            deadline: query.deadline,
          }).catch(() => {});
        }
      } catch {
        // Best-effort — one bad match/pitch shouldn't break the batch.
        continue;
      }
    }
  }
}
