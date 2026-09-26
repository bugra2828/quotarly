"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPitchEmail } from "@/lib/email/send-pitch";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const DAILY_SEND_LIMIT_PER_PROFILE = 10;

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  if (finalBody.includes("[VERIFY")) {
    redirect(
      `/app/approvals?error=${encodeURIComponent(
        "Remove all [VERIFY: ...] placeholders before sending."
      )}`
    );
  }

  // Rate limit: count today's already-sent pitches for this expert profile.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count: sentToday } = await supabase
    .from("pitches")
    .select("*", { count: "exact", head: true })
    .eq("expert_profile_id", match.expert_profile_id)
    .eq("status", "sent")
    .gte("sent_at", startOfDay.toISOString());

  if ((sentToday ?? 0) >= DAILY_SEND_LIMIT_PER_PROFILE) {
    redirect(
      `/app/approvals?error=${encodeURIComponent(
        `Daily send limit (${DAILY_SEND_LIMIT_PER_PROFILE}) reached for this profile. Try again tomorrow.`
      )}`
    );
  }

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

  if (!query?.reply_email) {
    redirect("/app/approvals?error=missing_reply_email");
  }

  if (query.deadline && new Date(query.deadline) < new Date()) {
    await supabase.from("pitches").update({ status: "expired" }).eq("id", pitchId);
    redirect("/app/approvals?error=deadline_passed");
  }

  try {
    const messageId = await sendPitchEmail({
      toEmail: query.reply_email,
      subject: pitch.subject,
      body: finalBody,
      senderDisplayName: expertProfile?.display_name ?? "Quotarly expert",
      replyToEmail: ownerProfile?.email ?? user.email!,
    });

    await supabase
      .from("pitches")
      .update({
        status: "sent",
        edited_body: editedBody || null,
        approved_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        resend_message_id: messageId,
      })
      .eq("id", pitchId);
  } catch (err) {
    await supabase
      .from("pitches")
      .update({ status: "failed", error: String(err) })
      .eq("id", pitchId);
    redirect(`/app/approvals?error=${encodeURIComponent(String(err))}`);
  }

  revalidatePath("/app/approvals");
}
