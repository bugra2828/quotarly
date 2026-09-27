import { Text, Link } from "@react-email/components";
import { EmailLayout, buttonStyle } from "./layout";

export function NewBacklinkEmail({
  outletDomain,
  articleUrl,
  authorityScore,
}: {
  outletDomain: string;
  articleUrl: string;
  authorityScore: number | null;
}) {
  return (
    <EmailLayout preview={`New backlink from ${outletDomain}`}>
      <Text style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px" }}>
        🎉 New backlink from {outletDomain}
      </Text>
      <Text style={{ fontSize: "14px", color: "#333333", lineHeight: "22px" }}>
        A journalist used your quote and linked back to your site. Quotarly
        found it during today's check.
      </Text>
      <Text style={{ fontSize: "13px", color: "#666666", marginTop: "8px" }}>
        Authority score: {authorityScore ?? "unknown"}
      </Text>
      <Link href={articleUrl} style={buttonStyle}>
        View the article
      </Link>
    </EmailLayout>
  );
}
