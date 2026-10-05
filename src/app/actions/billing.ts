"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/session";
import { cancelPaddleSubscription } from "@/lib/paddle/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function cancelSubscription() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("id, provider, provider_subscription_id, status")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!subscription || subscription.status === "canceled") {
    redirect("/app/settings?billing_error=no_active_subscription");
  }

  if (subscription.provider !== "paddle" || !subscription.provider_subscription_id) {
    redirect("/app/settings?billing_error=unsupported_provider");
  }

  try {
    await cancelPaddleSubscription(subscription.provider_subscription_id);
  } catch (err) {
    console.error("paddle cancel failed", err);
    redirect("/app/settings?billing_error=cancel_failed");
  }

  // Optimistic local update — the webhook will also fire and reconcile this,
  // but without this the settings page would still show "active" until then.
  await admin.from("subscriptions").update({ status: "canceled" }).eq("id", subscription.id);

  revalidatePath("/app/settings");
  redirect("/app/settings?billing_canceled=1");
}
