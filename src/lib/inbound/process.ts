import { createAdminClient } from "@/lib/supabase/admin";
import { parseNewsletter } from "@/lib/ai/parser";
import { runMatchingForQueries } from "@/lib/ai/pipeline";
import { sendOpsAlert } from "@/lib/email/notify";

export type InboundEmail = {
  fromEmail: string;
  subject: string;
  textBody: string;
  htmlBody: string;
};

export type ProcessResult = {
  status: number;
  body: Record<string, unknown>;
};

function toValidIsoOrNull(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Guard against a hallucinated past date (the model getting "today" wrong) —
  // treat anything more than a day stale as "no real deadline" rather than
  // silently dropping the query from matching.
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return date.getTime() < oneDayAgo ? null : date.toISOString();
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
  if (from.includes("qwoted"))
    return "qwoted";
  return "other";
}

export type StoredInboundEmail = InboundEmail & { id: string; source: string };

export type StoreResult =
  | { status: "stored"; email: StoredInboundEmail }
  | { status: "duplicate" }
  | { status: "error"; message: string };

const UNIQUE_VIOLATION = "23505";

/**
 * Saves the raw email. Passing the provider's message id makes this idempotent:
 * a redelivery of the same message comes back as "duplicate".
 */
export async function storeInboundEmail(
  email: InboundEmail,
  providerMessageId?: string
): Promise<StoreResult> {
  const { fromEmail, subject, textBody, htmlBody } = email;
  const source = detectSource(fromEmail, subject);

  const { data, error } = await createAdminClient()
    .from("inbound_emails")
    .insert({
      source,
      subject,
      from_email: fromEmail,
      raw_text: textBody,
      raw_html: htmlBody,
      parsed: false,
      provider_message_id: providerMessageId ?? null,
    })
    .select("id")
    .single();

  if (error?.code === UNIQUE_VIOLATION) return { status: "duplicate" };
  if (error || !data) {
    return { status: "error", message: error?.message ?? "insert returned no row" };
  }

  return { status: "stored", email: { ...email, id: data.id, source } };
}

/** Provider-agnostic pipeline: store the raw email, then parse and match it. */
export async function processInboundEmail(email: InboundEmail): Promise<ProcessResult> {
  const stored = await storeInboundEmail(email);
  if (stored.status === "error") {
    return { status: 500, body: { error: stored.message } };
  }
  if (stored.status === "duplicate") {
    return { status: 200, body: { ok: true, duplicate: true } };
  }
  return parseStoredEmail(stored.email);
}

/**
 * Parses a stored email into queries, saves them, and runs matching. A failure
 * leaves the row with parsed=false and sends an ops alert.
 */
export async function parseStoredEmail(email: StoredInboundEmail): Promise<ProcessResult> {
  const { id: inboundEmailId, source, subject, textBody, htmlBody } = email;
  const supabase = createAdminClient();

  try {
    const queries = await parseNewsletter(textBody || htmlBody);

    let insertedIds: string[] = [];

    if (queries.length > 0) {
      const { data: inserted, error: queriesError } = await supabase
        .from("queries")
        .insert(
          queries.map((q) => ({
            inbound_email_id: inboundEmailId,
            source,
            title: q.title,
            body: q.body,
            category: q.category,
            outlet_name: q.outlet_name,
            outlet_domain: q.outlet_domain,
            journalist_name: q.journalist_name,
            reply_email: q.reply_email,
            requirements: q.requirements,
            deadline: toValidIsoOrNull(q.deadline),
          }))
        )
        .select("id");

      if (queriesError) {
        await sendOpsAlert(
          "Inbound pipeline: failed to save parsed queries",
          `source=${source} subject="${subject}" inbound_email_id=${inboundEmailId}\n\n${queriesError.message}`
        ).catch(() => {});
        return {
          status: 500,
          body: { ok: false, queries_found: queries.length, error: queriesError.message },
        };
      }

      insertedIds = inserted?.map((q) => q.id) ?? [];
    }

    await supabase
      .from("inbound_emails")
      .update({ parsed: true })
      .eq("id", inboundEmailId);

    // Awaited so it actually finishes before the serverless function exits
    // (a fire-and-forget promise can get killed once the response is sent).
    // Best-effort — a matching/writing failure shouldn't fail the webhook,
    // the raw queries are already saved and can be matched later.
    await runMatchingForQueries(insertedIds).catch(() => {});

    return { status: 200, body: { ok: true, queries_found: queries.length } };
  } catch (err) {
    // Raw email is already stored; parsing can be retried later.
    await sendOpsAlert(
      "Inbound pipeline: newsletter parse failed",
      `source=${source} subject="${subject}" inbound_email_id=${inboundEmailId}\n\n${String(err)}`
    ).catch(() => {});
    return { status: 200, body: { ok: true, parse_error: String(err) } };
  }
}
