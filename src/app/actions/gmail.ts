"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { decrypt } from "@/lib/crypto/encryption";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function disconnectGmail(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const expertProfileId = String(formData.get("expert_profile_id"));

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("expert_profiles")
    .select("id")
    .eq("id", expertProfileId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/app/settings");

  const admin = createAdminClient();
  const { data: connection } = await admin
    .from("gmail_connections")
    .select("refresh_token_encrypted")
    .eq("expert_profile_id", expertProfileId)
    .maybeSingle();

  if (connection) {
    try {
      const refreshToken = decrypt(connection.refresh_token_encrypted);
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`,
        { method: "POST" }
      );
    } catch (err) {
      // Best-effort -- don't block the disconnect on Google's revoke
      // endpoint being flaky or the token already being invalid.
      console.error("gmail token revoke failed", err);
    }
  }

  await admin
    .from("gmail_connections")
    .delete()
    .eq("expert_profile_id", expertProfileId);

  revalidatePath("/app/settings");
}
