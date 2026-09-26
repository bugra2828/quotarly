import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_DOMAIN = process.env.RESEND_FROM_DOMAIN ?? "quotarly.com";

export async function sendNewBacklinkNotification(params: {
  toEmail: string;
  outletDomain: string;
  articleUrl: string;
  authorityScore: number | null;
}) {
  await resend.emails.send({
    from: `Quotarly <hello@${FROM_DOMAIN}>`,
    to: params.toEmail,
    subject: `🎉 New backlink from ${params.outletDomain}`,
    text: `Good news — a new backlink to your site was just detected.

Outlet: ${params.outletDomain}
Authority score: ${params.authorityScore ?? "unknown"}
Article: ${params.articleUrl}

— Quotarly`,
  });
}
