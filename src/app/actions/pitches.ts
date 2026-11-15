"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { parseMonthKey } from "@/lib/pitches/months";
import { attemptSendPitch } from "@/lib/pitches/send";
import { assemblePitch, plainPitch } from "@/lib/ai/writer";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Keeps the user in the month they were viewing when an action fails.
function approvalsErrorUrl(formData: FormData, error: string): string {
  const params = new URLSearchParams({ error });
  const month = parseMonthKey(String(formData.get("month") ?? ""));
  if (month) params.set("month", month.key);
  return `/app/approvals?${params}`;
}

const MIN_ANSWER_WORDS = 8;

// Interview mode: the expert's answers become the pitch. The AI only orders
// and proofreads them, then the pitch waits for review like any other draft.
export async function submitInterviewAnswers(formData: FormData) {
  const pitchId = String(formData.get("pitch_id"));

  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // RLS limits this to the user's own pitches.
  const { data: pitch } = await supabase
    .from("pitches")
    .select("id, status, interview_questions, matches(query_id, expert_profile_id)")
    .eq("id", pitchId)
    .single();

  if (!pitch || pitch.status !== "awaiting_answers") {
    redirect(approvalsErrorUrl(formData, "This request was already answered."));
  }

  const match = Array.isArray(pitch.matches) ? pitch.matches[0] : pitch.matches;
  if (!match) redirect(approvalsErrorUrl(formData, "match_not_found"));

  const questions: string[] = Array.isArray(pitch.interview_questions)
    ? pitch.interview_questions.map(String)
    : [];
  const answers = questions
    .map((question, i) => ({
      question,
      answer: String(formData.get(`answer_${i}`) ?? "").trim(),
    }))
    .filter((a) => a.answer);

  const totalWords = answers
    .map((a) => a.answer)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  if (totalWords < MIN_ANSWER_WORDS) {
    redirect(
      approvalsErrorUrl(
        formData,
        "Write at least a sentence or two in your own words before continuing."
      )
    );
  }

  const admin = createAdminClient();
  const [{ data: query }, { data: expert }] = await Promise.all([
    admin.from("queries").select("title, body, deadline").eq("id", match.query_id).single(),
    supabase
      .from("expert_profiles")
      .select("display_name, job_title, company")
      .eq("id", match.expert_profile_id)
      .single(),
  ]);

  if (query?.deadline && new Date(query.deadline) < new Date()) {
    redirect(approvalsErrorUrl(formData, "The deadline for this request has passed."));
  }

  const expertForWriter = {
    display_name: expert?.display_name ?? "Quotarly expert",
    job_title: expert?.job_title ?? null,
    company: expert?.company ?? null,
  };

  let body: string;
  try {
    body = await assemblePitch(
      `${query?.title ?? ""}\n\n${query?.body ?? ""}`,
      answers,
      expertForWriter
    );
  } catch {
    // If the AI is unavailable, the expert's answers still go through as-is.
    body = plainPitch(answers, expertForWriter);
  }

  await admin
    .from("pitches")
    .update({ body, interview_answers: answers, status: "pending_approval" })
    .eq("id", pitch.id)
    .eq("status", "awaiting_answers");

  revalidatePath("/app/approvals");
  revalidatePath("/app");
}

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
    redirect(approvalsErrorUrl(formData, "pitch_not_found"));
  }

  const match = Array.isArray(pitch.matches) ? pitch.matches[0] : pitch.matches;
  if (!match) redirect(approvalsErrorUrl(formData, "match_not_found"));

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
    redirect(approvalsErrorUrl(formData, result.message));
  }

  revalidatePath("/app/approvals");
}
