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
  limit = 100
): Promise<BacklinkItem[]> {
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
        filters: [["dofollow", "in", [true, false]]],
      },
    ]),
  });

  const json = await res.json();
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];

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
