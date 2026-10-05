// Paddle price IDs for each plan, created in the Paddle dashboard (Catalog).
export const PADDLE_PRICE_IDS = {
  starter: "pri_01m3w3y1y66rjezy86arb2mxy3",
  pro: "pri_01m3w3zy0f23620fkcym415f98",
  agency: "pri_01m3w41fqbwf2nkhdpcx9jg65v",
} as const;

export type PlanId = keyof typeof PADDLE_PRICE_IDS;
