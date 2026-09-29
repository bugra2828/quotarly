import { google } from "googleapis";
import { buildGmailClient } from "@/lib/gmail/connection";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

function buildRawMessage(params: {
  fromName: string;
  fromEmail: string;
  toEmail: string;
  replyToEmail: string;
  subject: string;
  body: string;
}): string {
  const headers = [
    `From: "${params.fromName}" <${params.fromEmail}>`,
    `To: ${params.toEmail}`,
    `Reply-To: ${params.replyToEmail}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
  ].join("\r\n");

  const message = `${headers}\r\n\r\n${params.body}`;
  return Buffer.from(message, "utf8").toString("base64url");
}

// Drop-in alternate to sendPitchEmail (src/lib/email/send-pitch.ts): same
// shape, but sends from the customer's own connected Gmail address instead
// of the shared pitch@quotarly.com -- the whole point of this feature.
export async function sendPitchEmailViaGmail(params: {
  admin: AdminClient;
  expertProfileId: string;
  toEmail: string;
  subject: string;
  body: string;
  senderDisplayName: string;
  replyToEmail: string;
  refreshToken: string;
  fromGmailEmail: string;
}): Promise<string> {
  const oauth2Client = buildGmailClient(
    params.admin,
    params.expertProfileId,
    params.refreshToken
  );
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const raw = buildRawMessage({
    fromName: params.senderDisplayName,
    fromEmail: params.fromGmailEmail,
    toEmail: params.toEmail,
    replyToEmail: params.replyToEmail,
    subject: params.subject,
    body: params.body,
  });

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  if (!res.data.id) throw new Error("Gmail API returned no message id");
  return res.data.id;
}
