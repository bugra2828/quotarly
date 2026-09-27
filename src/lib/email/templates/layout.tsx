import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { ReactNode } from "react";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f4f2", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "32px",
            borderRadius: "6px",
            maxWidth: "480px",
          }}
        >
          <Text
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#4f7dfd",
              margin: "0 0 20px",
            }}
          >
            Quotarly
          </Text>
          {children}
          <Hr style={{ borderColor: "#e5e5e5", margin: "28px 0 16px" }} />
          <Text style={{ fontSize: "11px", color: "#9a9a9a", margin: 0 }}>
            Quotarly · quotarly.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const buttonStyle = {
  display: "inline-block",
  backgroundColor: "#4f7dfd",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  padding: "10px 20px",
  borderRadius: "24px",
  textDecoration: "none",
  marginTop: "16px",
};
