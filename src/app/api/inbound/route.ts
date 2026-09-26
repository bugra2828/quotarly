import { createAdminClient } from "@/lib/supabase/admin";
import { parseNewsletter } from "@/lib/ai/parser";
import { type NextRequest, NextResponse } from "next/server";

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  const [, password] = decoded.split(":");
  return password === process.env.INBOUND_WEBHOOK_SECRET;
}

function detectSource(fromEmail: string, subject: string): string {
  const from = fromEmail.toLowerCase();
  const subj = subject.toLowerCase();
  if (from.includes("helpareporter") || from.includes("featured.com") || subj.includes("haro"))
    return "haro";
  if (from.includes("sourceofsources") || subj.includes("source of sources"))
    return "sos";
  if (from.includes("helpb2bwriter") || subj.includes("help a b2b writer"))
    return "hab2bw";
  return "other";
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
  const fromEmail = payload.FromFull?.Email ?? "";
  const subject = payload.Subject ?? "";
  const textBody = payload.TextBody ?? "";
  const htmlBody = payload.HtmlBody ?? "";
  const source = detectSource(fromEmail, subject);

  const supabase = createAdminClient();

  const { data: inboundEmail, error: insertError } = await supabase
    .from("inbound_emails")
    .insert({
      source,
      subject,
      from_email: fromEmail,
      raw_text: textBody,
      raw_html: htmlBody,
      parsed: false,
    })
    .select()
    .single();

  if (insertError || !inboundEmail) {
    return NextResponse.json({ error: insertError?.message }, { status: 500 });
  }

  try {
    const queries = await parseNewsletter(textBody || htmlBody);

    if (queries.length > 0) {
      await supabase.from("queries").insert(
        queries.map((q) => ({
          inbound_email_id: inboundEmail.id,
          source,
          title: q.title,
          body: q.body,
          category: q.category,
          outlet_name: q.outlet_name,
          outlet_domain: q.outlet_domain,
          journalist_name: q.journalist_name,
          reply_email: q.reply_email,
          requirements: q.requirements,
          deadline: q.deadline,
        }))
      );
    }

    await supabase
      .from("inbound_emails")
      .update({ parsed: true })
      .eq("id", inboundEmail.id);

    return NextResponse.json({ ok: true, queries_found: queries.length });
  } catch (err) {
    // Raw email is already stored; parsing can be retried later.
    return NextResponse.json(
      { ok: true, parse_error: String(err) },
      { status: 200 }
    );
  }
}
