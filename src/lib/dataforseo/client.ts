const BASE_URL = "https://api.dataforseo.com/v3";

function authHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN!;
  const password = process.env.DATAFORSEO_PASSWORD!;
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
}

export type BacklinkItem = {
  url_from: string;
  domain_from: string;
  url_to: string;
  anchor: string | null;
  dofollow: boolean;
  rank: number | null;
  first_seen: string | null;
};

// DataForSEO Backlinks API — "live" backlinks currently pointing at a domain.
// https://docs.dataforseo.com/v3/backlinks/backlinks/live
export async function fetchLiveBacklinks(
  targetDomain: string,
  options: { limit?: number; firstSeenAfter?: Date } = {}
): Promise<BacklinkItem[]> {
  const { limit = 1000, firstSeenAfter } = options;
  // Newest first, so the links we care about are never cut off by the limit.
  const filters = firstSeenAfter
    ? [["first_seen", ">", toDataForSeoTime(firstSeenAfter)]]
    : undefined;
  const res = await fetch(`${BASE_URL}/backlinks/backlinks/live`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        target: targetDomain,
        mode: "as_is",
        limit,
        order_by: ["first_seen,desc"],
        ...(filters ? { filters } : {}),
      },
    ]),
  });

  if (!res.ok) throw new Error(`DataForSEO backlinks failed: ${res.status}`);
  const json = await res.json();
  const task = json?.tasks?.[0];
  if (task && task.status_code !== 20000) {
    throw new Error(`DataForSEO backlinks failed: ${task.status_code} ${task.status_message}`);
  }
  const items = task?.result?.[0]?.items ?? [];

  return items.map(
    (item: {
      url_from: string;
      domain_from: string;
      url_to: string;
      anchor: string | null;
      dofollow: boolean;
      rank: number | null;
      first_seen: string | null;
    }) => ({
      url_from: item.url_from,
      domain_from: item.domain_from,
      url_to: item.url_to,
      anchor: item.anchor,
      dofollow: item.dofollow,
      rank: item.rank,
      first_seen: item.first_seen,
    })
  );
}

// "2026-11-13 06:00:00 +00:00", the time format DataForSEO filters expect.
function toDataForSeoTime(date: Date): string {
  return `${date.toISOString().slice(0, 19).replace("T", " ")} +00:00`;
}

// Google organic results for a query (US, English), via DataForSEO SERP API.
// https://docs.dataforseo.com/v3/serp/google/organic/live/advanced
export async function searchGoogle(keyword: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/serp/google/organic/live/advanced`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ keyword, location_code: 2840, language_code: "en", depth: 10 }]),
  });

  if (!res.ok) throw new Error(`DataForSEO SERP failed: ${res.status}`);
  const json = await res.json();
  const task = json?.tasks?.[0];
  if (task && task.status_code !== 20000) {
    throw new Error(`DataForSEO SERP failed: ${task.status_code} ${task.status_message}`);
  }
  const items: { type: string; url?: string }[] = task?.result?.[0]?.items ?? [];
  return items.filter((i) => i.type === "organic" && i.url).map((i) => i.url!);
}
