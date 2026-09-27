import { Text, Link } from "@react-email/components";
import { EmailLayout, buttonStyle } from "./layout";

export function PendingApprovalEmail({
  outletName,
  queryTitle,
  deadline,
}: {
  outletName: string | null;
  queryTitle: string | null;
  deadline: string | null;
}) {
  return (
    <EmailLayout preview="A drafted quote is waiting in your approval queue">
      <Text style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px" }}>
        A quote is waiting for you
      </Text>
      <Text style={{ fontSize: "14px", color: "#333333", lineHeight: "22px" }}>
        {outletName ? `${outletName} asked` : "A journalist asked"}
        {queryTitle ? `: "${queryTitle}"` : " a question that fits your profile"}.
        Quotarly drafted a quote in your voice — it's sitting in your
        approval queue until you review it.
      </Text>
      {deadline && (
        <Text style={{ fontSize: "13px", color: "#a8321f", marginTop: "8px" }}>
          Deadline: {new Date(deadline).toLocaleString()}
        </Text>
      )}
      <Link href="https://quotarly.com/app/approvals" style={buttonStyle}>
        Review the draft
      </Link>
    </EmailLayout>
  );
}
