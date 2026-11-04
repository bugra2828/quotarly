import { processInboundEmail } from "@/lib/inbound/process";
import { type NextRequest, NextResponse } from "next/server";

// Legacy Postmark inbound webhook. Kept working until the Gmail filters are
// switched over to the Resend address (see ./resend/route.ts).

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  const [, password] = decoded.split(":");
  return password === process.env.INBOUND_WEBHOOK_SECRET;
}

// Postmark inbound webhook payload shape (subset we care about).
type PostmarkInboundPayload = {
  FromFull?: { Email?: string; Name?: string };
  Subject?: string;
  TextBody?: string;
  HtmlBody?: string;
};

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as PostmarkInboundPayload;
  const result = await processInboundEmail({
    fromEmail: payload.FromFull?.Email ?? "",
    subject: payload.Subject ?? "",
    textBody: payload.TextBody ?? "",
    htmlBody: payload.HtmlBody ?? "",
  });

  return NextResponse.json(result.body, { status: result.status });
}
