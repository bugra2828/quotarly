import { parseStoredEmail, storeInboundEmail } from "@/lib/inbound/process";
import { after, type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Bounds the parse/match work in after(), which outlasts the response.
export const maxDuration = 300;

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

  const stored = await storeInboundEmail(
    {
      fromEmail: extractAddress(email.from ?? ""),
      subject: email.subject ?? "",
      textBody: email.text ?? "",
      htmlBody: email.html ?? "",
    },
    event.data.email_id
  );

  if (stored.status === "error") {
    return NextResponse.json({ error: stored.message }, { status: 500 });
  }
  if (stored.status === "duplicate") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Resend retries a webhook that takes too long to answer, and parsing can
  // take longer than that limit, so acknowledge first and do the work after.
  after(() => parseStoredEmail(stored.email));

  return NextResponse.json({ ok: true });
}
