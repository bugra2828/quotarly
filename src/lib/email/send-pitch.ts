import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// (a) from spec 6.3: our own domain subdomain identity, Reply-To set to the
// client's real email so a journalist's reply reaches them, not us.
const FROM_DOMAIN = process.env.RESEND_FROM_DOMAIN ?? "quotarly.com";

export async function sendPitchEmail(params: {
  toEmail: string;
  subject: string;
  body: string;
  senderDisplayName: string;
  replyToEmail: string;
}) {
  const { data, error } = await resend.emails.send({
    from: `${params.senderDisplayName} via Quotarly <pitch@${FROM_DOMAIN}>`,
    to: params.toEmail,
    replyTo: params.replyToEmail,
    subject: params.subject,
    text: params.body,
  });

  if (error) throw new Error(error.message);
  return data!.id;
}
