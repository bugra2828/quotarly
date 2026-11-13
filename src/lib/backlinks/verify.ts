// Checks an article ourselves instead of trusting a crawler index: is there a
// link to the customer's domain on the page, and is it followed?

export type LinkCheck =
  | { status: "linked"; dofollow: boolean; anchor: string | null }
  | { status: "missing" } // page fetched (or gone), no link to the target
  | { status: "unreachable" }; // blocked, timed out or errored: says nothing

const USER_AGENT = "Mozilla/5.0 (compatible; QuotarlyBot/1.0; +https://quotarly.com)";
const MAX_HTML_CHARS = 3_000_000;

export function normalizeDomain(input: string): string {
  let host = input.trim().toLowerCase();
  try {
    host = new URL(host.includes("://") ? host : `https://${host}`).hostname;
  } catch {
    host = host.replace(/^https?:\/\//, "").split("/")[0];
  }
  return host.replace(/^www\./, "");
}

/** True when `host` is `domain` itself or one of its subdomains. */
export function isSameSite(host: string, domain: string): boolean {
  const h = normalizeDomain(host);
  const d = normalizeDomain(domain);
  return h === d || h.endsWith(`.${d}`);
}

function readAttr(attrs: string, name: string): string | null {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? (m[1] ?? m[2] ?? m[3] ?? null) : null;
}

export async function checkArticleLink(articleUrl: string, targetDomain: string): Promise<LinkCheck> {
  let html: string;
  try {
    const res = await fetch(articleUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404 || res.status === 410) return { status: "missing" };
    if (!res.ok) return { status: "unreachable" };
    html = (await res.text()).slice(0, MAX_HTML_CHARS);
  } catch {
    return { status: "unreachable" };
  }

  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1];
    const href = readAttr(attrs, "href");
    if (!href) continue;

    let host: string;
    try {
      host = new URL(href, articleUrl).hostname;
    } catch {
      continue;
    }
    if (!isSameSite(host, targetDomain)) continue;

    const rel = (readAttr(attrs, "rel") ?? "").toLowerCase().split(/\s+/);
    const dofollow = !rel.some((r) => r === "nofollow" || r === "ugc" || r === "sponsored");
    const anchor =
      m[2]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200) || null;
    return { status: "linked", dofollow, anchor };
  }

  return { status: "missing" };
}
