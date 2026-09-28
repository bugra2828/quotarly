import { sendPitchEmail } from "@/lib/email/send-pitch";
import {
  isPastDeadline,
  hasUnresolvedVerifyTag,
  hasReachedDailyLimit,
} from "@/lib/pitches/rules";
import type { createAdminClient } from "@/lib/supabase/admin";

type SupabaseLike = ReturnType<typeof createAdminClient>;

export const DAILY_SEND_LIMIT_PER_PROFILE = 10;

export type SendPitchResult =
  | { ok: true; messageId: string }
  | {
      ok: false;
      reason:
        | "verify_tag"
        | "deadline_passed"
        | "daily_limit"
        | "missing_reply_email"
        | "send_failed";
      message: string;
    };

// Shared by the manual "Approve & send" action and the auto-send path in the
// matcher/writer pipeline — one place that decides whether a drafted pitch is
// actually safe to send, and sends it.
export async function attemptSendPitch(params: {
  supabase: SupabaseLike;
  pitchId: string;
  expertProfileId: string;
  expertDisplayName: string;
  subject: string;
  body: string;
  replyEmail: string | null;
  deadline: string | null;
  ownerEmail: string;
  editedBody?: string | null;
}): Promise<SendPitchResult> {
  const {
    supabase,
    pitchId,
    expertProfileId,
    expertDisplayName,
    subject,
    body,
    replyEmail,
    deadline,
    ownerEmail,
    editedBody,
  } = params;

  if (hasUnresolvedVerifyTag(body)) {
    return {
      ok: false,
      reason: "verify_tag",
      message: "Remove all [VERIFY: ...] placeholders before sending.",
    };
  }

  if (!replyEmail) {
    return {
      ok: false,
      reason: "missing_reply_email",
      message: "This query has no reply email on file.",
    };
  }

  if (isPastDeadline(deadline)) {
    await supabase.from("pitches").update({ status: "expired" }).eq("id", pitchId);
    return {
      ok: false,
      reason: "deadline_passed",
      message: "The deadline for this query has passed.",
    };
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count: sentToday } = await supabase
    .from("pitches")
    .select("*", { count: "exact", head: true })
    .eq("expert_profile_id", expertProfileId)
    .eq("status", "sent")
    .gte("sent_at", startOfDay.toISOString());

  if (hasReachedDailyLimit(sentToday ?? 0, DAILY_SEND_LIMIT_PER_PROFILE)) {
    return {
      ok: false,
      reason: "daily_limit",
      message: `Daily send limit (${DAILY_SEND_LIMIT_PER_PROFILE}) reached for this profile. Try again tomorrow.`,
    };
  }

  try {
    const messageId = await sendPitchEmail({
      toEmail: replyEmail,
      subject,
      body,
      senderDisplayName: expertDisplayName,
      replyToEmail: ownerEmail,
    });

    await supabase
      .from("pitches")
      .update({
        status: "sent",
        edited_body: editedBody ?? null,
        approved_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        resend_message_id: messageId,
      })
      .eq("id", pitchId);

    return { ok: true, messageId };
  } catch (err) {
    await supabase
      .from("pitches")
      .update({ status: "failed", error: String(err) })
      .eq("id", pitchId);
    return { ok: false, reason: "send_failed", message: String(err) };
  }
}
