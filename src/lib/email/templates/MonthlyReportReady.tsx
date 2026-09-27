import { Text, Link } from "@react-email/components";
import { EmailLayout, buttonStyle } from "./layout";

export function MonthlyReportReadyEmail({
  monthLabel,
  pitchesSent,
  backlinksWon,
}: {
  monthLabel: string;
  pitchesSent: number;
  backlinksWon: number;
}) {
  return (
    <EmailLayout preview={`Your ${monthLabel} report is ready`}>
      <Text style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px" }}>
        Your {monthLabel} report is ready
      </Text>
      <Text style={{ fontSize: "14px", color: "#333333", lineHeight: "22px" }}>
        {pitchesSent} pitch{pitchesSent === 1 ? "" : "es"} sent,{" "}
        {backlinksWon} backlink{backlinksWon === 1 ? "" : "s"} won last
        month. Download the full PDF or check your live dashboard.
      </Text>
      <Link href="https://quotarly.com/app/reports" style={buttonStyle}>
        View report
      </Link>
    </EmailLayout>
  );
}
