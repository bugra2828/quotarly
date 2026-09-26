export const LEMONSQUEEZY_BUY_URLS = {
  starter: "https://quotarly.lemonsqueezy.com/checkout/buy/5fab26c9-a5da-43cf-bd4f-6cacfc581ae0",
  pro: "https://quotarly.lemonsqueezy.com/checkout/buy/4893f4a6-ee93-4fef-baf6-c6fda3108899",
  agency: "https://quotarly.lemonsqueezy.com/checkout/buy/a0e58ab3-f7ce-458e-9aed-312c04bf46fd",
} as const;

export type PlanId = keyof typeof LEMONSQUEEZY_BUY_URLS;

// Embeds the Quotarly user id as custom_data so the Lemon Squeezy webhook can
// attribute the resulting subscription back to the right account, and
// pre-fills the checkout email.
export function buildCheckoutUrl(plan: PlanId, userId: string, email: string) {
  const url = new URL(LEMONSQUEEZY_BUY_URLS[plan]);
  url.searchParams.set("checkout[email]", email);
  url.searchParams.set("checkout[custom][user_id]", userId);
  return url.toString();
}
