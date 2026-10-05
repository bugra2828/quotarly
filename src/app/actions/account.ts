"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/session";
import { cancelPaddleSubscription } from "@/lib/paddle/api";
import { redirect } from "next/navigation";

// Deleting the auth.users row cascades through profiles -> expert_profiles ->
// matches/pitches/backlinks/monthly_reports/gmail_connections/subscriptions
// via the FK `on delete cascade` chain set up in the migrations, so this one
// call is enough to erase everything owned by the account.
export async function deleteAccount() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("provider, provider_subscription_id, status")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    subscription &&
    subscription.status !== "canceled" &&
    subscription.provider === "paddle" &&
    subscription.provider_subscription_id
  ) {
    await cancelPaddleSubscription(subscription.provider_subscription_id).catch((err) => {
      // Don't block account deletion on a billing-provider hiccup — the
      // subscription row is about to be deleted anyway; worst case we
      // follow up manually in Paddle's dashboard.
      console.error("paddle cancel during account deletion failed", err);
    });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    redirect("/app/settings?delete_error=1");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/?account_deleted=1");
}
