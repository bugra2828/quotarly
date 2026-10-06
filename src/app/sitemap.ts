import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://quotarly.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/pricing",
    "/how-it-works",
    "/blog",
    "/blog/getting-your-first-quote-approved",
    "/blog/how-to-get-quoted-in-an-article",
    "/blog/backlinks-without-guest-posting",
    "/terms",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}
