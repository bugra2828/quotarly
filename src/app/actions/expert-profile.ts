"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

const MIN_BIO_WORDS = 40;

function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Uploads the optional headshot to Storage and returns its public URL, or
// null if the user didn't attach one. One file per user (overwrites any
// previous headshot) so we don't accumulate orphaned uploads.
async function uploadHeadshot(
  supabase: SupabaseClient,
  userId: string,
  formData: FormData
): Promise<string | null> {
  const file = formData.get("headshot");
  if (!(file instanceof File) || file.size === 0) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/headshot.${ext}`;

  const { error } = await supabase.storage
    .from("headshots")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return null;

  return supabase.storage.from("headshots").getPublicUrl(path).data
    .publicUrl;
}

export async function createExpertProfile(formData: FormData) {
  const supabase = await createClient();
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const bio = String(formData.get("bio") ?? "");
  if (countWords(bio) < MIN_BIO_WORDS) {
    redirect(
      `/app/onboarding?error=${encodeURIComponent(
        `Bio needs at least ${MIN_BIO_WORDS} words (currently ${countWords(bio)}).`
      )}`
    );
  }

  const headshotUrl = await uploadHeadshot(supabase, user.id, formData);

  const { error } = await supabase.from("expert_profiles").insert({
    owner_id: user.id,
    display_name: String(formData.get("display_name") ?? ""),
    job_title: String(formData.get("job_title") ?? ""),
    company: String(formData.get("company") ?? ""),
    website_url: String(formData.get("website_url") ?? ""),
    target_url: String(formData.get("target_url") ?? ""),
    bio,
    expertise_topics: formData.getAll("expertise_topics").map(String),
    excluded_topics: splitList(formData.get("excluded_topics")),
    tone: String(formData.get("tone") ?? ""),
    sample_quotes: splitList(formData.get("sample_quotes")),
    linkedin_url: String(formData.get("linkedin_url") ?? ""),
    headshot_url: headshotUrl,
  });

  if (error) {
    redirect(`/app/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

export async function updateExpertProfile(formData: FormData) {
  const expertProfileId = String(formData.get("expert_profile_id"));

  const supabase = await createClient();
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const bio = String(formData.get("bio") ?? "");
  if (countWords(bio) < MIN_BIO_WORDS) {
    redirect(
      `/app/profile/${expertProfileId}/edit?error=${encodeURIComponent(
        `Bio needs at least ${MIN_BIO_WORDS} words (currently ${countWords(bio)}).`
      )}`
    );
  }

  const headshotUrl = await uploadHeadshot(supabase, user.id, formData);

  const update: Record<string, unknown> = {
    display_name: String(formData.get("display_name") ?? ""),
    job_title: String(formData.get("job_title") ?? ""),
    company: String(formData.get("company") ?? ""),
    website_url: String(formData.get("website_url") ?? ""),
    target_url: String(formData.get("target_url") ?? ""),
    bio,
    expertise_topics: formData.getAll("expertise_topics").map(String),
    excluded_topics: splitList(formData.get("excluded_topics")),
    tone: String(formData.get("tone") ?? ""),
    sample_quotes: splitList(formData.get("sample_quotes")),
    linkedin_url: String(formData.get("linkedin_url") ?? ""),
  };
  // Only touch headshot_url if a new file was actually uploaded — otherwise
  // leave the existing one in place.
  if (headshotUrl) update.headshot_url = headshotUrl;

  const { error } = await supabase
    .from("expert_profiles")
    .update(update)
    .eq("id", expertProfileId)
    .eq("owner_id", user.id);

  if (error) {
    redirect(
      `/app/profile/${expertProfileId}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/app");
  redirect("/app?updated=1");
}

// Toggles between "send the moment a quote clears your bar" (the default)
// and "hold every quote for my manual review" for one expert profile.
export async function toggleAutoApprove(formData: FormData) {
  const expertProfileId = String(formData.get("expert_profile_id"));
  const nextValue = formData.get("next_value") === "true";

  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  await supabase
    .from("expert_profiles")
    .update({ auto_approve: nextValue })
    .eq("id", expertProfileId)
    .eq("owner_id", user.id);

  revalidatePath("/app");
}
