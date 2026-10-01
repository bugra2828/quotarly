import crypto from "node:crypto";
import { PADDLE_PRICE_IDS, type PlanId } from "./checkout";

// Paddle signs webhooks as `Paddle-Signature: ts=<unix_ts>;h1=<hex_hmac>`,
// where h1 = HMAC-SHA256(secret, `${ts}:${rawBody}`).
export function isValidSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => p.split("=") as [string, string])
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1));
}

export function mapPlan(priceId: string): PlanId | null {
  const entry = Object.entries(PADDLE_PRICE_IDS).find(
    ([, id]) => id === priceId
  );
  return (entry?.[0] as PlanId) ?? null;
}
