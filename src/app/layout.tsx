import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-dispatch",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://quotarly.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quotarly — Turn expert quotes into backlinks that rank",
    template: "%s — Quotarly",
  },
  description:
    "Quotarly matches your expertise to live journalist queries, drafts the quote in your voice, and waits for your approval before it ever gets sent.",
  verification: {
    google: "kCBfVrNldfyy5pRZslgroY1gBm0e74J-kzFs41cf9rs",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
