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
    <EmailLayout preview="A journalist request fits you: answer 2-3 quick questions">
      <Text style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px" }}>
        A journalist request fits you
      </Text>
      <Text style={{ fontSize: "14px", color: "#333333", lineHeight: "22px" }}>
        {outletName ? `${outletName} asked` : "A journalist asked"}
        {queryTitle ? `: "${queryTitle}"` : " a question that fits your profile"}.
        Answer 2-3 quick questions in your own words. Quotarly puts your
        answers in order and fixes typos, then you review and send it.
      </Text>
      {deadline && (
        <Text style={{ fontSize: "13px", color: "#a8321f", marginTop: "8px" }}>
          Deadline: {new Date(deadline).toLocaleString()}
        </Text>
      )}
      <Link href="https://quotarly.com/app/approvals" style={buttonStyle}>
        Answer the questions
      </Link>
    </EmailLayout>
  );
}
