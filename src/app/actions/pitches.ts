"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { attemptSendPitch } from "@/lib/pitches/send";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function rejectPitch(formData: FormData) {
  const pitchId = String(formData.get("pitch_id"));
  const supabase = await createClient();

  await supabase.from("pitches").update({ status: "rejected" }).eq("id", pitchId);

  revalidatePath("/app/approvals");
}

export async function approvePitch(formData: FormData) {
  const pitchId = String(formData.get("pitch_id"));
  const editedBody = String(formData.get("body") ?? "").trim();

  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: pitch } = await supabase
    .from("pitches")
    .select("*, matches(query_id, expert_profile_id)")
    .eq("id", pitchId)
    .single();

  if (!pitch) {
    redirect("/app/approvals?error=pitch_not_found");
  }

  const match = Array.isArray(pitch.matches) ? pitch.matches[0] : pitch.matches;
  if (!match) redirect("/app/approvals?error=match_not_found");

  const finalBody = editedBody || pitch.body;

  const [{ data: expertProfile }, { data: ownerProfile }] = await Promise.all([
    supabase
      .from("expert_profiles")
      .select("display_name")
      .eq("id", match.expert_profile_id)
      .single(),
    supabase.from("profiles").select("email").eq("id", user.id).single(),
  ]);

  // "queries" is admin/service-only at the RLS layer — safe to read here via
  // the admin client because we already verified (via RLS above) that this
  // user owns the pitch/match pointing at this specific query id.
  const admin = createAdminClient();
  const { data: query } = await admin
    .from("queries")
    .select("reply_email, deadline")
    .eq("id", match.query_id)
    .single();

  const result = await attemptSendPitch({
    supabase: admin,
    pitchId,
    expertProfileId: match.expert_profile_id,
    expertDisplayName: expertProfile?.display_name ?? "Quotarly expert",
    subject: pitch.subject,
    body: finalBody,
    replyEmail: query?.reply_email ?? null,
    deadline: query?.deadline ?? null,
    ownerEmail: ownerProfile?.email ?? user.email!,
    editedBody: editedBody || null,
  });

  if (!result.ok) {
    redirect(`/app/approvals?error=${encodeURIComponent(result.message)}`);
  }

  revalidatePath("/app/approvals");
}
