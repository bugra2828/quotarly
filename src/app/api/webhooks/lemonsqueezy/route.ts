import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSignature, mapPlan } from "@/lib/lemonsqueezy/webhook";
import { type NextRequest, NextResponse } from "next/server";

type LemonSqueezyWebhookPayload = {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      product_name: string;
      renews_at: string | null;
      ends_at: string | null;
    };
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!isValidSignature(rawBody, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  const eventName = payload.meta.event_name;
  const userId = payload.meta.custom_data?.user_id;

  if (!userId) {
    // No way to attribute this subscription to a Quotarly account — ack the
    // webhook so Lemon Squeezy doesn't retry forever, but log for review.
    console.error("lemonsqueezy webhook missing custom_data.user_id", eventName);
    return NextResponse.json({ ok: true, warning: "missing user_id" });
  }

  const supabase = createAdminClient();
  const sub = payload.data;
  const plan = mapPlan(sub.attributes.product_name);

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated": {
      await supabase.from("subscriptions").upsert(
        {
          owner_id: userId,
          provider: "lemonsqueezy",
          provider_subscription_id: sub.id,
          plan,
          status: sub.attributes.status,
          current_period_end: sub.attributes.renews_at,
        },
        { onConflict: "provider_subscription_id" }
      );
      break;
    }
    case "subscription_cancelled":
    case "subscription_payment_failed": {
      await supabase
        .from("subscriptions")
        .update({ status: sub.attributes.status })
        .eq("provider_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
