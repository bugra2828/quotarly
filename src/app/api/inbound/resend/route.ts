import { processInboundEmail } from "@/lib/inbound/process";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's `from` is a display string like `Name <addr@x.com>`; keep the address.
function extractAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim();
}

/**
 * Resend inbound webhook (`email.received`). The webhook only carries
 * metadata, so the body is fetched from the Received Emails API.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook secret not configured" }, { status: 500 });
  }

  // Raw text is required: re-serialized JSON would break the signature.
  const payload = await request.text();

  let event: ReturnType<typeof resend.webhooks.verify>;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const { data: email, error } = await resend.emails.receiving.get(event.data.email_id);
  if (error || !email) {
    // Non-2xx makes Resend retry the delivery.
    return NextResponse.json(
      { error: error?.message ?? "failed to fetch received email" },
      { status: 502 }
    );
  }

  const result = await processInboundEmail({
    fromEmail: extractAddress(email.from ?? ""),
    subject: email.subject ?? "",
    textBody: email.text ?? "",
    htmlBody: email.html ?? "",
  });

  return NextResponse.json(result.body, { status: result.status });
}
