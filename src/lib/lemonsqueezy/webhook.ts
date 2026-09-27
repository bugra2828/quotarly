import crypto from "node:crypto";

export function isValidSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuf = Buffer.from(digest);
  const signatureBuf = Buffer.from(signature);
  if (digestBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(digestBuf, signatureBuf);
}

export function mapPlan(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes("agency")) return "agency";
  if (name.includes("pro")) return "pro";
  if (name.includes("starter")) return "starter";
  return productName;
}
