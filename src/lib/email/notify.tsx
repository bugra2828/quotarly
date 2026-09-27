import { Resend } from "resend";
import { PendingApprovalEmail } from "./templates/PendingApproval";
import { NewBacklinkEmail } from "./templates/NewBacklink";
import { MonthlyReportReadyEmail } from "./templates/MonthlyReportReady";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_DOMAIN = process.env.RESEND_FROM_DOMAIN ?? "quotarly.com";
const FROM = `Quotarly <hello@${FROM_DOMAIN}>`;

export async function sendPendingApprovalNotification(params: {
  toEmail: string;
  outletName: string | null;
  queryTitle: string | null;
  deadline: string | null;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.toEmail,
    subject: params.outletName
      ? `A quote is waiting for you — ${params.outletName}`
      : "A quote is waiting for you",
    react: (
      <PendingApprovalEmail
        outletName={params.outletName}
        queryTitle={params.queryTitle}
        deadline={params.deadline}
      />
    ),
  });
}

export async function sendNewBacklinkNotification(params: {
  toEmail: string;
  outletDomain: string;
  articleUrl: string;
  authorityScore: number | null;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.toEmail,
    subject: `🎉 New backlink from ${params.outletDomain}`,
    react: (
      <NewBacklinkEmail
        outletDomain={params.outletDomain}
        articleUrl={params.articleUrl}
        authorityScore={params.authorityScore}
      />
    ),
  });
}

export async function sendMonthlyReportReadyNotification(params: {
  toEmail: string;
  monthLabel: string;
  pitchesSent: number;
  backlinksWon: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: params.toEmail,
    subject: `Your ${params.monthLabel} report is ready`,
    react: (
      <MonthlyReportReadyEmail
        monthLabel={params.monthLabel}
        pitchesSent={params.pitchesSent}
        backlinksWon={params.backlinksWon}
      />
    ),
  });
}
