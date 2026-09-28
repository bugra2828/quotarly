"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createExpertProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("expert_profiles").insert({
    owner_id: user.id,
    display_name: String(formData.get("display_name") ?? ""),
    job_title: String(formData.get("job_title") ?? ""),
    company: String(formData.get("company") ?? ""),
    website_url: String(formData.get("website_url") ?? ""),
    target_url: String(formData.get("target_url") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    expertise_topics: splitList(formData.get("expertise_topics")),
    excluded_topics: splitList(formData.get("excluded_topics")),
    tone: String(formData.get("tone") ?? ""),
    sample_quotes: splitList(formData.get("sample_quotes")),
    linkedin_url: String(formData.get("linkedin_url") ?? ""),
  });

  if (error) {
    redirect(`/app/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

// Toggles between "send the moment a quote clears your bar" (the default)
// and "hold every quote for my manual review" for one expert profile.
export async function toggleAutoApprove(formData: FormData) {
  const expertProfileId = String(formData.get("expert_profile_id"));
  const nextValue = formData.get("next_value") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("expert_profiles")
    .update({ auto_approve: nextValue })
    .eq("id", expertProfileId)
    .eq("owner_id", user.id);

  revalidatePath("/app");
}
