import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSignature, mapPlan } from "@/lib/paddle/webhook";
import { sendPaymentFailedNotification } from "@/lib/email/notify";
import { track } from "@vercel/analytics/server";
import { type NextRequest, NextResponse } from "next/server";

type PaddleWebhookPayload = {
  event_type: string;
  data: {
    id: string;
    status: string;
    custom_data?: { user_id?: string } | null;
    items: { price: { id: string } }[];
    current_billing_period: { ends_at: string } | null;
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!isValidSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PaddleWebhookPayload;
  const eventType = payload.event_type;
  const userId = payload.data.custom_data?.user_id;

  if (!userId) {
    // No way to attribute this subscription to a Quotarly account — ack the
    // webhook so Paddle doesn't retry forever, but log for review.
    console.error("paddle webhook missing custom_data.user_id", eventType);
    return NextResponse.json({ ok: true, warning: "missing user_id" });
  }

  const supabase = createAdminClient();
  const sub = payload.data;
  const plan = mapPlan(sub.items[0]?.price.id);

  switch (eventType) {
    case "subscription.created":
    case "subscription.updated": {
      if (eventType === "subscription.created" && sub.status === "active") {
        await track("Subscription started", { plan: plan ?? "unknown" });
      }

      await supabase.from("subscriptions").upsert(
        {
          owner_id: userId,
          provider: "paddle",
          provider_subscription_id: sub.id,
          plan,
          status: sub.status,
          current_period_end: sub.current_billing_period?.ends_at ?? null,
        },
        { onConflict: "provider_subscription_id" }
      );

      if (sub.status === "past_due") {
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .single();

        if (ownerProfile?.email) {
          await sendPaymentFailedNotification({ toEmail: ownerProfile.email }).catch(() => {});
        }
      }
      break;
    }
    case "subscription.canceled":
    case "subscription.paused": {
      await supabase
        .from("subscriptions")
        .update({ status: sub.status })
        .eq("provider_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
